import mongoose from "mongoose";

const categoriesSchema = new mongoose.Schema(
  {
    category: { type: String },
    image: { type: String , default: "" },
  },
  { timestamps: true }
);

export const Categories = mongoose.model("Category", categoriesSchema);

