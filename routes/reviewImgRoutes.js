import express from "express";
import multer from "multer";
import { uploadReviewImage, getAllReviewImages, deleteReviewImage } from "../controllers/reviewImgController.js";
import { authorizeRoles, isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

// Storage configuration
const uploadsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/reviewImg"); // Folder where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep the original file name
  }
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
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

// public routes
router.get("/", getAllReviewImages);

// protected + admin routes
router.post("/upload",isAuthenticated,authorizeRoles("admin"), uploads.single("reviewImg"), uploadReviewImage);
router.delete("/:id",isAuthenticated,authorizeRoles("admin"), deleteReviewImage);

export default router;
