import mongoose from "mongoose";

const reviewImgSchema = new mongoose.Schema(
  {
    reviewImg: { type: String , default: "" },
  },
  { timestamps: true }
);

export const ReviewImg = mongoose.model("reviewimg", reviewImgSchema);
