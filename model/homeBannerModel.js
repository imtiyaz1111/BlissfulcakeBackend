import mongoose from "mongoose";

const homeBannerSchema = new mongoose.Schema(
  {
    bannerImg: { type: String , default: "" },
  },
  { timestamps: true }
);

export const HomeBanner = mongoose.model("HomeBanner", homeBannerSchema);
