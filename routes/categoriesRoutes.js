import express from "express";
import multer from "multer";
import {
  createCategory,
  getAllCategories,
  getSingleCategory, // ✅ new import
  deleteCategory,
  updateCategory,
} from "../controllers/categoriesController.js";
import { authorizeRoles, isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

// Storage configuration
const uploadsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/categoryImg"); // Folder where category images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep original file name
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

// public routes
router.get("/", getAllCategories);
router.get("/:id", getSingleCategory); // ✅ new route

// protected + admin routes
router.post(
  "/create",
  isAuthenticated,
  authorizeRoles("admin"),
  uploads.single("image"),
  createCategory
);
router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteCategory
);
router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  uploads.single("image"),
  updateCategory
);

export default router;
