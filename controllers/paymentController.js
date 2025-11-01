// backend/controllers/paymentController.js
import Stripe from "stripe";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Order from "../model/Order.js";
import Transaction from "../model/Transaction.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create Stripe Checkout Session
 * - Sends metadata including userId, address, discount, couponCode, and items JSON
 */
export const createCheckoutSession = async (req, res) => {
  try {
    const {
      cartItems,
      userEmail,
      successUrl,
      cancelUrl,
      address,
      discount = 0,
      couponCode = "",
    } = req.body;

    const userId = req.user && req.user._id ? req.user._id.toString() : null;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Build metadata items (stringify) so webhook can reconstruct order items
    const metadata = {
      userId: userId || "",
      email: userEmail || "",
      discount: (Number(discount) || 0).toString(),
      couponCode: couponCode || "",
      address: JSON.stringify(address || {}),
      items: JSON.stringify(
        cartItems.map((item) => ({
          id: item.product._id,
          name: item.product.name,
          price: item.product.weights?.[0]?.price || 0,
          qty: item.quantity,
        }))
      ),
    };

    // Create a single summary line item for the final amount
    // Calculate subtotal and additional charges here to keep total stable
    const subtotal = cartItems.reduce(
      (acc, item) => acc + (item.product.weights?.[0]?.price || 0) * item.quantity,
      0
    );
    const shippingEstimate = 20;
    const deliveryChargeAmount = subtotal > 0 && subtotal < 300 ? 50 : 0;
    const totalBeforeDiscount = subtotal + shippingEstimate + deliveryChargeAmount;
    const totalAfterDiscount = Math.max(totalBeforeDiscount - Number(discount || 0), 0);

    const lineItems = [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: "Order Total",
            description:
              discount > 0
                ? `Includes discount ₹${Number(discount).toFixed(2)}`
                : "Order total",
          },
          unit_amount: Math.round(totalAfterDiscount * 100),
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });

    return res.status(200).json({ success: true, checkoutUrl: session.url });
  } catch (error) {
    console.error("❌ Stripe session error:", error);
    return res.status(500).json({ success: false, message: "Stripe session creation failed" });
  }
};

/**
 * Stripe webhook handler
 * - Uses raw body (provided by server verify) to validate signature
 * - Handles checkout.session.completed and creates Order + Transaction
 * - Idempotent: checks for existing order with the same payment intent before creating
 */
export const stripeWebhook = async (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    // req.rawBody should be set by the server's express.json verify() function (see server.js)
    const rawBody = req.rawBody && req.rawBody.length ? req.rawBody : Buffer.from(JSON.stringify(req.body));
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Only handle relevant events
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata || {};

    // Parse metadata safely
    const userId = metadata.userId || null;
    const email = metadata.email || null;
    const discount = parseFloat(metadata.discount || 0) || 0;
    const couponCode = metadata.couponCode || null;
    const address = metadata.address ? safeJSONParse(metadata.address, {}) : {};
    const items = metadata.items ? safeJSONParse(metadata.items, []) : [];

    const totalAmount = session.amount_total ? session.amount_total / 100 : 0;
    const stripePaymentIntent = session.payment_intent || session.payment_intent?.toString?.();

    // Idempotency check: if an order already exists with this stripePaymentIntent, skip creating duplicate
    try {
      // Use a mongoose session to create both docs atomically
      const mongoSession = await mongoose.startSession();
      mongoSession.startTransaction();

      try {
        // If stripePaymentIntent present, check existing order
        if (stripePaymentIntent) {
          const existing = await Order.findOne({ stripePaymentIntent }).session(mongoSession);
          if (existing) {
            console.log("ℹ️ Order already exists for payment intent:", stripePaymentIntent);
            await mongoSession.commitTransaction();
            mongoSession.endSession();
            return res.json({ received: true });
          }
        }

        // Build order items (match your Order schema)
        const orderItems = items.map((i) => ({
          productId: i.id,
          productName: i.name,
          quantity: i.qty,
          price: i.price,
        }));

        const newOrder = new Order({
          userId,
          items: orderItems,
          totalAmount,
          address,
          paymentMethod: "Online",
          paymentStatus: "Paid",
          orderStatus: "Processing",
          stripePaymentIntent,
          // If your Order schema doesn't have discountApplied/couponCode, add them to schema or omit them
          discountApplied: discount > 0 ? discount : 0,
          couponCode: couponCode || null,
        });

        await newOrder.save({ session: mongoSession });

        const newTransaction = new Transaction({
          userId,
          orderId: newOrder._id,
          transactionId: stripePaymentIntent || session.id,
          amount: totalAmount,
          paymentMethod: "Online",
          status: "Success",
        });

        await newTransaction.save({ session: mongoSession });

        // Optionally: clear user cart here if you maintain carts server-side.
        await mongoSession.commitTransaction();
        console.log("✅ Order & Transaction created via webhook for:", email || userId);
      } catch (innerErr) {
        await mongoSession.abortTransaction();
        console.error("❌ Failed to create order/transaction inside transaction:", innerErr);
      } finally {
        mongoSession.endSession();
      }
    } catch (err) {
      console.error("❌ Error while handling checkout.session.completed:", err);
    }
  } else {
    console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  // Acknowledge receipt of the event
  res.json({ received: true });
};

/** small helper to safely parse JSON */
function safeJSONParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}
