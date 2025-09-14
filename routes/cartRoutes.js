import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js"; // auth middleware

const router = express.Router();

// Add product to cart
router.post("/add", protect, addToCart);

// Get cart
router.get("/", protect, getCart);

// Update cart item quantity
router.put("/update", protect, updateCartItem);

// Remove product from cart
router.delete("/remove/:productId", protect, removeFromCart);

// Clear entire cart
router.delete("/clear", protect, clearCart);

export default router;
