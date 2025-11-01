import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

// Add product to cart
router.post("/add", isAuthenticated, addToCart);

// Get cart
router.get("/", isAuthenticated, getCart);

// Update cart item quantity
router.put("/update", isAuthenticated, updateCartItem);

// Remove product from cart
router.delete("/remove/:productId", isAuthenticated, removeFromCart);

// Clear entire cart
router.delete("/clear", isAuthenticated, clearCart);

export default router;
