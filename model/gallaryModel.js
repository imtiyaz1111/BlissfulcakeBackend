import mongoose from "mongoose";

const gallarySchema = new mongoose.Schema(
  {
    gallaryImage: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Gallary = mongoose.model("Gallary", gallarySchema);
