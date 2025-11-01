import express from "express";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlistController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

// Add to wishlist
router.post("/add", isAuthenticated, addToWishlist);

// Get wishlist
router.get("/", isAuthenticated, getWishlist);

// Remove from wishlist
router.delete("/remove/:productId", isAuthenticated, removeFromWishlist);

export default router;
