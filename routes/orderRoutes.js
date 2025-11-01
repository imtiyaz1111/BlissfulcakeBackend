// routes/orderRoutes.js
import express from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById, // ✅ added import
  updateOrderStatus,
} from "../controllers/orderController.js";
import {
  isAuthenticated,
  authorizeRoles,
} from "../middleware/isAuthenticated.js";

const router = express.Router();

// 🛒 Create a new order (COD or after payment success)
router.post("/create", isAuthenticated, createOrder);

// 👤 Get all orders for logged-in user
router.get("/user", isAuthenticated, getUserOrders);

// 👑 Admin: Get all orders
router.get("/all", isAuthenticated, authorizeRoles("admin"), getAllOrders);

// ✅ Get single order by ID (for order details page)
router.get("/:id", isAuthenticated, getOrderById);


// 👑 Admin: Update order status
router.put(
  "/update/:orderId",
  isAuthenticated,
  authorizeRoles("admin"),
  updateOrderStatus
);

export default router;
