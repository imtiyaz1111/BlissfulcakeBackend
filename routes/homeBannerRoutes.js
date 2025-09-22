import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  uploadBannerImage,
  getAllBannerImages,
  deleteBannerImage,
} from "../controllers/homeBannerController.js";
import { authorizeRoles, isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

// Ensure upload folder exists
const uploadDir = path.join(process.cwd(), "uploads", "bannerImg");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Storage configuration
const uploadsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${file.originalname}`;
    cb(null, uniqueName);
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Public routes
router.get("/", getAllBannerImages);

// Protected + admin routes
router.post(
  "/upload",
  isAuthenticated,
  authorizeRoles("admin"),
  uploads.single("bannerImg"),
  uploadBannerImage
);

router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteBannerImage
);

export default router;
