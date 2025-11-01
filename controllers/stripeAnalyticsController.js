// controllers/stripeAnalyticsController.js
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ 1. Total Revenue
export const getTotalRevenue = async (req, res) => {
  try {
    let total = 0;
    let hasMore = true;
    let startingAfter = null;

    while (hasMore) {
      const payments = await stripe.paymentIntents.list({
        limit: 100,
        starting_after: startingAfter || undefined,
      });

      for (const p of payments.data) {
        if (p.status === "succeeded") total += p.amount_received;
      }

      hasMore = payments.has_more;
      if (hasMore) startingAfter = payments.data[payments.data.length - 1].id;
    }

    res.json({ success: true, totalRevenue: total / 100, currency: "INR" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 2. Revenue by Period (day, week, month)
export const getRevenueByPeriod = async (req, res) => {
  try {
    const { period = "month" } = req.query;
    const now = Math.floor(Date.now() / 1000);

    let startTime;
    if (period === "day") startTime = now - 86400;
    else if (period === "week") startTime = now - 7 * 86400;
    else startTime = now - 30 * 86400;

    const payments = await stripe.paymentIntents.list({
      limit: 100,
      created: { gte: startTime },
    });

    const total = payments.data
      .filter((p) => p.status === "succeeded")
      .reduce((sum, p) => sum + p.amount_received, 0);

    res.json({
      success: true,
      period,
      revenue: total / 100,
      currency: "INR",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 3. Average Order Value
export const getAverageOrderValue = async (req, res) => {
  try {
    let total = 0;
    let count = 0;
    let hasMore = true;
    let startingAfter = null;

    while (hasMore) {
      const payments = await stripe.paymentIntents.list({
        limit: 100,
        starting_after: startingAfter || undefined,
      });

      payments.data.forEach((p) => {
        if (p.status === "succeeded") {
          total += p.amount_received;
          count++;
        }
      });

      hasMore = payments.has_more;
      if (hasMore) startingAfter = payments.data[payments.data.length - 1].id;
    }

    res.json({
      success: true,
      averageOrderValue: count ? total / count / 100 : 0,
      currency: "INR",
      totalOrders: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 4. Transaction Stats Summary
export const getTransactionStats = async (req, res) => {
  try {
    let success = 0,
      failed = 0,
      canceled = 0,
      total = 0;
    let hasMore = true;
    let startingAfter = null;

    while (hasMore) {
      const payments = await stripe.paymentIntents.list({
        limit: 100,
        starting_after: startingAfter || undefined,
      });

      payments.data.forEach((p) => {
        total++;
        if (p.status === "succeeded") success++;
        else if (p.status === "requires_payment_method") failed++;
        else if (p.status === "canceled") canceled++;
      });

      hasMore = payments.has_more;
      if (hasMore) startingAfter = payments.data[payments.data.length - 1].id;
    }

    res.json({
      success: true,
      total,
      successCount: success,
      failedCount: failed,
      canceledCount: canceled,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


