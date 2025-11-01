import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import userReviewImg from "./routes/reviewImgRoutes.js";
import homeBannerRoutes from "./routes/homeBannerRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import gallaryRoutes from "./routes/gallaryRoutes.js";
import addressRoutes from "./routes/addressRoutes.js"
import contactRoutes from "./routes/contactRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import wishlistRoutes from "./routes/wishlistRoutes.js"
import profileRoutes from "./routes/profileRoutes.js"
import couponRoutes from "./routes/couponRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import stripeAnalyticsRoutes from "./routes/stripeAnalyticsRoutes.js";
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



// ✅ Expose the uploads folder so images can be accessed via URL
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


// IMPORTANT: capture raw body for Stripe webhook only
app.use(
  express.json({
    verify: (req, _res, buf) => {
      // If route is webhook, attach raw buffer for verification
      // Adjust the path prefix if your webhook route is different
      if (req.originalUrl && req.originalUrl.startsWith("/api/payment/webhook")) {
        req.rawBody = buf;
      }
    },
  })
);

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use("/api/payment", paymentRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/stripe", stripeAnalyticsRoutes);

// Routes
app.use("/api/user", userRoutes);
app.use("/api/reviewimg", userReviewImg);
app.use("/api/homebanner", homeBannerRoutes);
app.use("/api/gallary", gallaryRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/cart",cartRoutes );
app.use("/api/wishlist",wishlistRoutes );
app.use("/api/coupon", couponRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
