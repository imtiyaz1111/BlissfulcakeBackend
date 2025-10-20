import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Products from "../model/productModel.js";
import asyncHandler from "express-async-handler";

// Helper: validate MongoDB ID
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ✅ CREATE PRODUCT with Image Upload
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, flavor, weights, countInStock } =
      req.body;

    if (!name || !description || !category)
      return res.status(400).json({
        success: false,
        message: "Name, description, and category are required",
      });

    if (countInStock && isNaN(countInStock))
      return res.status(400).json({
        success: false,
        message: "countInStock must be a number",
      });

    let parsedWeights = [];
    if (weights) {
      try {
        parsedWeights =
          typeof weights === "string" ? JSON.parse(weights) : weights;
        if (!Array.isArray(parsedWeights))
          throw new Error("Weights must be an array");
        parsedWeights.forEach((w) => {
          if (!w.label || isNaN(w.price) || isNaN(w.discountedPrice)) {
            throw new Error("Invalid weight object");
          }
        });
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid weights format",
        });
      }
    }

    const productImg = req.file
      ? `/uploads/productImg/${req.file.filename}`
      : "";

    const product = await Products.create({
      name,
      description,
      category,
      flavor,
      weights: parsedWeights,
      image: productImg,
      countInStock: countInStock ?? 0,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const products = await Products.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "All products fetched successfully",
      count: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET SINGLE PRODUCT
export const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });

    const product = await Products.findById(id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const product = await Products.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const { name, description, category, flavor, weights, countInStock } =
      req.body;

    if (countInStock && isNaN(countInStock)) {
      return res.status(400).json({
        success: false,
        message: "countInStock must be a number",
      });
    }

    let parsedWeights = weights;
    if (weights) {
      try {
        parsedWeights =
          typeof weights === "string" ? JSON.parse(weights) : weights;
        if (!Array.isArray(parsedWeights))
          throw new Error("Weights must be an array");

        parsedWeights.forEach((w) => {
          if (!w.label || isNaN(w.price) || isNaN(w.discountedPrice)) {
            throw new Error("Invalid weight object");
          }
        });
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid weights format",
        });
      }
    }

    // Handle new image
    if (req.file) {
      if (product.image) {
        const oldImagePath = path.join(
          process.cwd(),
          "uploads",
          "productImg",
          path.basename(product.image)
        );
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      product.image = `/uploads/productImg/${req.file.filename}`;
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;
    product.flavor = flavor || product.flavor;
    product.weights = parsedWeights || product.weights;
    product.countInStock = countInStock ?? product.countInStock;

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });

    const product = await Products.findById(id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (product.image) {
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "productImg",
        path.basename(product.image)
      );
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await product.deleteOne();
    return res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ CREATE PRODUCT REVIEW
export const createProductReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });

    const { rating, comment } = req.body;
    if (!rating || isNaN(rating) || rating < 1 || rating > 5)
      return res
        .status(400)
        .json({ success: false, message: "Rating must be 1-5" });

    const product = await Products.findById(id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed)
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });

    const review = {
      name: req.user.username,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    return res
      .status(201)
      .json({ success: true, message: "Review added successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ ADMIN REPLY TO REVIEW
export const replyToReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const { reply } = req.body;

    if (!isValidObjectId(productId) || !isValidObjectId(reviewId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid IDs provided" });

    const product = await Products.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const review = product.reviews.id(reviewId);
    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });

    review.reply = reply;
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Reply added successfully",
      review,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Admin update review status
export const updateReviewStatus = asyncHandler(async (req, res) => {
  const { productId, reviewId } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["pending", "approved", "not approved"];
  if (!allowedStatuses.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid review status" });
  }

  const product = await Products.findById(productId);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  const review = product.reviews.id(reviewId);
  if (!review) {
    return res
      .status(404)
      .json({ success: false, message: "Review not found" });
  }

  review.status = status;
  await product.save();

  res.status(200).json({
    success: true,
    message: "Review status updated successfully",
    review,
  });
});

// ✅ GET RELATED PRODUCTS
export const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });

    const product = await Products.findById(id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const relatedProducts = await Products.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(5);

    return res.status(200).json({ success: true, data: relatedProducts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET PRODUCTS BY CATEGORY
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    if (!category)
      return res
        .status(400)
        .json({ success: false, message: "Category is required" });

    const products = await Products.find({ category });
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

