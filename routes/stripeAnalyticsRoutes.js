// routes/stripeAnalyticsRoutes.js
import express from "express";
import {
  getTotalRevenue,
  getRevenueByPeriod,
  getAverageOrderValue,
  getTransactionStats,
} from "../controllers/stripeAnalyticsController.js";
import { isAuthenticated, authorizeRoles } from "../middleware/isAuthenticated.js";

const router = express.Router();

// Admin-only access
router.get("/total-revenue", isAuthenticated, authorizeRoles("admin"), getTotalRevenue);
router.get("/revenue-by-period", isAuthenticated, authorizeRoles("admin"), getRevenueByPeriod);
router.get("/average-order-value", isAuthenticated, authorizeRoles("admin"), getAverageOrderValue);
router.get("/transaction-stats", isAuthenticated, authorizeRoles("admin"), getTransactionStats);

export default router;
