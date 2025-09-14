import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import userReviewImg from "./routes/reviewImgRoutes.js";
import homeBannerRoutes from "./routes/homeBannerRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import path from "path";
import cors from "cors"; // ✅ import cors

dotenv.config();
connectDB();

const app = express();

// ✅ Enable CORS
app.use(
  cors({
    origin: ["http://localhost:5173"], // React/Vite frontend URL
    credentials: true, // allow cookies/auth headers
  })
);

// Middleware to parse JSON
app.use(express.json());

// ✅ Expose the uploads folder so images can be accessed via URL
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/reviewimg", userReviewImg);
app.use("/api/homebanner", homeBannerRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
