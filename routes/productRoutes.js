import express from "express";
import multer from "multer";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductsByCategory,
  getRelatedProducts,
  replyToReview,
  updateReviewStatus,
} from "../controllers/productController.js";
import { authorizeRoles, isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

// Storage configuration
const uploadsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/productImg"); // Folder where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // safer unique naming
  },
});

// File filter for images only
const uploadFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Multer config
const uploads = multer({
  storage: uploadsStorage,
  fileFilter: uploadFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// Public routes
router.get("/", getProducts);
// fetch products by category (placed before /:id to avoid conflict)
router.get("/product/:category", getProductsByCategory);
router.get("/:id", getProductById);
router.get("/related/:id", getRelatedProducts);

// Protected + Admin routes
router.post(
  "/create",
  isAuthenticated,
  authorizeRoles("admin"),
  uploads.single("image"),
  createProduct
);
router.put(
  "/update/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  uploads.single("image"),
  updateProduct
);
router.delete(
  "/delete/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteProduct
);

// Reviews
router.post("/reviews/:id", isAuthenticated, createProductReview);

// ✅ Admin Reply to Review
router.post(
  "/reviews/:productId/:reviewId/reply",
  isAuthenticated,
  authorizeRoles("admin"),
  replyToReview
);

// ✅ Admin: Update review status
router.put(
  "/reviews/:productId/:reviewId/status",
  isAuthenticated,
  authorizeRoles("admin"),
  updateReviewStatus
);

export default router;
