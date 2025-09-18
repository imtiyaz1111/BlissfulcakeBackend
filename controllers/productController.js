import fs from "fs";
import path from "path";
import Product from "../model/productModel.js";

// ✅ CREATE PRODUCT with Image Upload
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      deliveryInformation,
      careInstructions,
      manufactureDetails,
      flavor,
      weights,
      countInStock,
    } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // If file uploaded, store path
    const productImg = req.file
      ? `/uploads/productImg/${req.file.filename}`
      : "";

    const product = await Product.create({
      name,
      description,
      deliveryInformation,
      careInstructions,
      manufactureDetails,
      category,
      flavor,
      weights,
      image: productImg,
      countInStock,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "All products fetched successfully",
      count: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET SINGLE PRODUCT BY ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ UPDATE PRODUCT (with optional new image)
export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      smallDescription,
      description,
      category,
      flavor,
      weights,
      countInStock,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // If new image uploaded, remove old image from server
    if (req.file) {
      if (product.image) {
        const oldImagePath = path.join(
          process.cwd(),
          "uploads",
          "productImg",
          path.basename(product.image)
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      product.image = `/uploads/productImg/${req.file.filename}`;
    }

    product.name = name || product.name;
    product.smallDescription = smallDescription || product.smallDescription;
    product.description = description || product.description;
    product.category = category || product.category;
    product.flavor = flavor || product.flavor;
    product.weights = weights || product.weights;
    product.countInStock = countInStock ?? product.countInStock;

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ DELETE PRODUCT (also remove image from server)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Remove image from server if exists
    if (product.image) {
      const filePath = path.join(
        process.cwd(),
        "uploads",
        "productImg",
        path.basename(product.image)
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ CREATE PRODUCT REVIEW (User only)
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

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

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
