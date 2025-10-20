import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one wishlist per user
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

// Optional: prevent duplicate products programmatically
wishlistSchema.methods.addProduct = function (productId) {
  if (!this.products.includes(productId)) {
    this.products.push(productId);
  }
  return this.save();
};

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
export default Wishlist;
