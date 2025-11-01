// model/Transaction.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  transactionId: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["Online", "COD"], required: true },
  status: { type: String, enum: ["Pending", "Success", "Failed"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
