import express from "express";
import {
  changePassword,
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  updatePassword,
  verification,
  verifyOTP,
  getAllUsers,
  toggleUserStatus,
  resendOtp, // ✅ Import resendOtp
} from "../controllers/userController.js";
import {
  isAuthenticated,
  authorizeRoles,
} from "../middleware/isAuthenticated.js";
import { userSchema, validateUser } from "../validators/userValidate.js";

const router = express.Router();

router.post("/register", validateUser(userSchema), registerUser);
router.post("/verify", verification);
router.post("/login", loginUser);
router.post("/logout", isAuthenticated, logoutUser);

// password reset flow
router.post("/forgot-password", forgotPassword);
router.post("/resend-otp", resendOtp); 
router.post("/verify-otp/:email", verifyOTP);
router.post("/change-password/:email", changePassword);

// ✅ update password (for logged-in users)
router.put("/update-password", isAuthenticated, updatePassword);

// ✅ admin routes
router.get("/all-users", isAuthenticated, authorizeRoles("admin"), getAllUsers);
router.put(
  "/toggle-user/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  toggleUserStatus
);

// ✅ example of role-based route
router.get(
  "/admin-only",
  isAuthenticated,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({ success: true, message: "Welcome Admin!" });
  }
);

export default router;
