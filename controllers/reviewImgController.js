import { ReviewImg } from "../model/reviewImgModel.js";
import fs from "fs";
import path from "path";

// Upload review image
export const uploadReviewImage = async (req, res) => {
  try {
    const reviewImg = req.file ? `/uploads/reviewImg/${req.file.filename}` : "";
    const review = await ReviewImg.create({ reviewImg });

    res.status(201).json({success: true,message:"Upload Review Successfully", data: review});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all review images
export const getAllReviewImages = async (req, res) => {
  try {
    const images = await ReviewImg.find().sort({ createdAt: -1 });
    res.status(200).json({success: true,message:"All Review Fetch Successfully", data: images});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete review image
export const deleteReviewImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await ReviewImg.findById(id);

    if (!image) {
      return res.status(404).json({success: false, message: "Image not found" });
    }

    // Delete file from server if exists
    const filePath = path.join(process.cwd(), "uploads", "reviewImg", path.basename(image.reviewImg));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await image.deleteOne();
    res.status(200).json({success: true, message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
