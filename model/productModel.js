import mongoose from "mongoose";

// ✅ Review schema with status field
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "not approved"], 
      default: "pending",
    },
    reply: {
      type: String, // admin's reply
      default: "",
    },
  },
  { timestamps: true }
);

// ✅ Weight option sub-schema
const weightOptionSchema = mongoose.Schema({
  label: { type: String, required: true }, 
  price: { type: Number, required: true },
  discountedPrice: { type: Number, default: 0 }, 
});

// ✅ Product schema
const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, 
    flavor: { type: String }, 

    // ✅ Multiple weight options
    weights: {
      type: [weightOptionSchema],
    },
    image: { type: String }, 
    countInStock: { type: Number, required: true, default: 0 },
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema], 
  },
  { timestamps: true }
);

const Products = mongoose.model("Product", productSchema);
export default Products;
