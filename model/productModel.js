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
      enum: ["pending", "approved", "not approved"], // only these 3 values allowed
      default: "pending",
    },
  },
  { timestamps: true }
);

// ✅ Weight option sub-schema
const weightOptionSchema = mongoose.Schema({
  label: { type: String, required: true }, // e.g. "1kg"
  price: { type: Number, required: true }, // price for that weight
  discountedPrice: { type: Number, default: 0 }, // optional discounted price
});

// ✅ Product schema
const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, // e.g., Birthday, Wedding, Cupcakes
    flavor: { type: String }, // e.g., Chocolate, Vanilla, Red Velvet
    deliveryInformation: { type: String, required: true },
    careInstructions: { type: String },
    manufactureDetails: { type: String },

    // ✅ Multiple weight options
    weights: {
      type: [weightOptionSchema],
      default: [
        { label: "1kg", price: 0, discountedPrice: 0 },
        { label: "1.5kg", price: 0, discountedPrice: 0 },
        { label: "2kg", price: 0, discountedPrice: 0 },
        { label: "2.5kg", price: 0, discountedPrice: 0 },
        { label: "3kg", price: 0, discountedPrice: 0 },
        { label: "3.5kg", price: 0, discountedPrice: 0 },
        { label: "4kg", price: 0, discountedPrice: 0 },
      ],
    },

    image: { type: String }, // product main image URL or path
    countInStock: { type: Number, required: true, default: 0 },
    quantity: { type: Number, default: 1 }, // default quantity

    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema], // list of user reviews
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
