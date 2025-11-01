import fs from "fs";
import path from "path";
import { Categories } from "../model/coategoriesModel.js";

// Create category
export const createCategory = async (req, res) => {
  try {
    const { category } = req.body;
    const image = req.file ? `/uploads/categoryImg/${req.file.filename}` : "";

    const categoryData = await Categories.create({ category, image });

    res.status(201).json({
      success: true,
      message: "Category Created Successfully",
      data: categoryData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Categories.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "All Categories Fetched Successfully",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Categories.findById(id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Delete file from server if exists
    if (category.image) {
      const filePath = path.join(process.cwd(), category.image); // category.image already has `/uploads/categoryImg/...`
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await category.deleteOne();
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;
    const categoryData = await Categories.findById(id);

    if (!categoryData) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Replace image if new one uploaded
    if (req.file) {
      if (categoryData.image) {
        const oldPath = path.join(process.cwd(), categoryData.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      categoryData.image = `/uploads/categoryImg/${req.file.filename}`;
    }

    if (category) {
      categoryData.category = category;
    }

    await categoryData.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: categoryData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single category by ID
export const getSingleCategory = async (req, res) => {
  try {
    const category = await Categories.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data:category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};