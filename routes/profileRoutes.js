import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/profileController.js";
import multer from "multer";
import fs from "fs";
import path from "path";
const router = express.Router();

// Ensure upload folder exists
const uploadDir = path.join(process.cwd(), "uploads", "profileImages");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Multer config
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// ✅ Get profile
router.get("/", isAuthenticated, getUserProfile);

// ✅ Update profile with image upload
router.put(
  "/update",
  isAuthenticated,
  upload.single("profileImage"),
  updateUserProfile
);

export default router;
