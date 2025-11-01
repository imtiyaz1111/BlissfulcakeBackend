// controllers/orderController.js
import Order from "../model/Order.js";
import Cart from "../model/cartModel.js";
import Transaction from "../model/Transaction.js";
import mongoose from "mongoose";

/**
 * ✅ Create a new Order (for COD or Stripe success page)
 * - Creates order document
 * - Logs a Transaction
 * - Clears user's cart
 */
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      address,
      paymentMethod,
      paymentStatus,
      orderStatus,
      totalAmount,
      stripePaymentIntent,
    } = req.body;

    const userId = req.user._id;

    // 🛒 Find the user's cart and populate items
    const cart = await Cart.findOne({ user: userId })
      .populate("items.product")
      .session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // 🧾 Prepare order items
    const orderItems = cart.items.map((item) => ({
      productId: item.product._id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.weights?.[0]?.price || 0, // fallback to 0 if missing
    }));

    // 🧾 Create new order
    const newOrder = new Order({
      userId,
      items: orderItems,
      totalAmount,
      address,
      paymentMethod,
      paymentStatus,
      orderStatus,
      stripePaymentIntent,
    });

    await newOrder.save({ session });

    // 💳 Log a transaction
    const transaction = new Transaction({
      userId,
      orderId: newOrder._id,
      amount: totalAmount,
      paymentMethod,
      transactionId:
        paymentMethod === "Online"
          ? stripePaymentIntent || "N/A"
          : newOrder._id.toString(),
      status: paymentStatus,
    });

    await transaction.save({ session });

    // 🧹 Clear user's cart
    cart.items = [];
    await cart.save({ session });

    // ✅ Commit all operations
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: newOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Fetch user orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("items.productId") // ✅ fixed here
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("❌ Error fetching user orders:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user orders" });
  }
};

// Fetch all orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId") // ✅ fixed here
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("❌ Error fetching all orders:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch all orders" });
  }
};

/**
 * ✅ NEW: Get a single order by ID
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Fetch order and ensure it belongs to the logged-in user (for security)
    const order = await Order.findOne({ _id: id, userId })
      .populate("items.productId")
      .populate("userId", "name email");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found or unauthorized" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("❌ Error fetching order by ID:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch order details" });
  }
};


/**
 * Update an order's status (Admin only)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.orderStatus = orderStatus;
    await order.save();

    res
      .status(200)
      .json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update order status" });
  }
};
