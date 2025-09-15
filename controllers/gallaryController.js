import fs from "fs";
import path from "path";
import { Gallary } from "../model/gallaryModel.js";

// Upload gallery image
export const uploadGallaryImage = async (req, res) => {
  try {
    const gallaryImage = req.file
      ? `/uploads/gallaryImg/${req.file.filename}`
      : "";

    const gallary = await Gallary.create({ gallaryImage });

    res.status(201).json({
      success: true,
      message: "Gallery uploaded successfully",
      data: gallary,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all gallery images
export const getAllGallaryImages = async (req, res) => {
  try {
    const images = await Gallary.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "All gallery images fetched successfully",
      data: images,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete gallery image
export const deleteGallaryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Gallary.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Delete file from server if exists
    const filePath = path.join(
      process.cwd(),
      "uploads",
      "gallaryImg",
      path.basename(image.gallaryImage)
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await image.deleteOne();

    res.status(200).json({
      success: true,
      message: "Gallery image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
