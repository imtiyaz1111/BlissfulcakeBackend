import fs from "fs";
import path from "path";
import { HomeBanner } from "../model/homeBannerModel.js";

// Upload banner image
export const uploadBannerImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const bannerImg = `/uploads/bannerImg/${req.file.filename}`;
    const banner = await HomeBanner.create({ bannerImg });

    res.status(201).json({
      success: true,
      message: "Banner uploaded successfully",
      data: banner,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all banner images
export const getAllBannerImages = async (req, res) => {
  try {
    const images = await HomeBanner.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "All banners fetched successfully",
      data: images,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete banner image
export const deleteBannerImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await HomeBanner.findById(id);

    if (!image) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    // Delete file from server if exists
    const filePath = path.join(process.cwd(), "uploads", "bannerImg", path.basename(image.bannerImg));
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete banner image:", err);
      });
    }

    await image.deleteOne();

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
