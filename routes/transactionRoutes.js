// routes/transactionRoutes.js
import express from "express";
import {
  getAllTransactions,
  getUserTransactions,
} from "../controllers/transactionController.js";
import { authorizeRoles, isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

/**
 * 🔹 ADMIN: Get all transactions
 * URL: /api/transactions/all
 */
router.get("/all", isAuthenticated, authorizeRoles("admin"), getAllTransactions);

/**
 * 🔹 USER: Get logged-in user's transactions
 * URL: /api/transactions/user
 */
router.get("/user", isAuthenticated, getUserTransactions);

export default router;
