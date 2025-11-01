// controllers/transactionController.js
import Transaction from "../model/Transaction.js";

/**
 * 🔹 ADMIN: Get all transactions
 */
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("userId", "name email")
      .populate("orderId", "_id totalAmount paymentStatus orderStatus")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All transactions fetched successfully",
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error("❌ Error fetching all transactions:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
};

/**
 * 🔹 USER: Get logged-in user's transactions
 */
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ userId })
      .populate("orderId", "_id totalAmount paymentStatus orderStatus")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "User transactions fetched successfully",
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error("❌ Error fetching user transactions:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user transactions" });
  }
};
