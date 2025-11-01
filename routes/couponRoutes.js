import express from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/couponController.js";
import { authorizeRoles, isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

// Admin Routes
router.post("/create", isAuthenticated, authorizeRoles("admin"), createCoupon);
router.get("/", isAuthenticated, authorizeRoles("admin"), getAllCoupons);
router.get("/:id", isAuthenticated, authorizeRoles("admin"), getCouponById);
router.put("/:id", isAuthenticated, authorizeRoles("admin"), updateCoupon);
router.delete("/:id", isAuthenticated, authorizeRoles("admin"), deleteCoupon);

// Public route (for user checkout)
router.post("/validate", isAuthenticated, validateCoupon);

export default router;
