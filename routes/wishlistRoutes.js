import express from "express";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js"; // ✅ middleware for authentication

const router = express.Router();

// Add to wishlist
router.post("/add", protect, addToWishlist);

// Get wishlist
router.get("/", protect, getWishlist);

// Remove from wishlist
router.delete("/remove/:productId", protect, removeFromWishlist);

export default router;
