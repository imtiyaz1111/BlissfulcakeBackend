
import fs from "fs";
import path from "path";
import { HomeBanner } from "../model/homeBannerModel.js";

// Upload review image
export const uploadBannerImage = async (req, res) => {
  try {
    const bannerImg = req.file ? `/uploads/bannerImg/${req.file.filename}` : "";
    const banner = await HomeBanner.create({ bannerImg });

    res.status(201).json({success: true,message:"Upload Banner Successfully", data: banner});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all review images
export const getAllBannerImages = async (req, res) => {
  try {
    const images = await HomeBanner.find().sort({ createdAt: -1 });
    res.status(200).json({success: true,message:"All Banner Fetch Successfully", data: images});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete review image
export const deleteBannerImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await HomeBanner.findById(id);

    if (!image) {
      return res.status(404).json({success: false, message: "Image not found" });
    }

    // Delete file from server if exists
    const filePath = path.join(process.cwd(), "uploads", "bannerImg", path.basename(image.bannerImg));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await image.deleteOne();
    res.status(200).json({ success: true,message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
