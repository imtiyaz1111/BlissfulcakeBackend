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
} from "../controllers/productController.js";
import { authorizeRoles, isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

// Storage configuration
const uploadsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/productImg"); // Folder where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep the original file name
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
router.get("/:id", getProductById);
// Fetch products by category
router.get("/product/:category", getProductsByCategory);

// Fetch related products for a specific product
router.get("/related/:id", getRelatedProducts);


// Protected + Admin routes
router.post("/create", isAuthenticated,authorizeRoles("admin"), uploads.single("image"),createProduct);
router.put("/update/:id", isAuthenticated,authorizeRoles("admin"), uploads.single("image"), updateProduct);
router.delete("/delete/:id", isAuthenticated,authorizeRoles("admin"),  deleteProduct);

// Reviews (only logged in users can review)
router.post("/reviews/:id", isAuthenticated, createProductReview);


export default router;
