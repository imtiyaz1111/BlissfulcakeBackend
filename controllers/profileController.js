import { User } from "../model/userModel.js";
import fs from "fs";
import path from "path";

// ✅ Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "-password -otp -otpExpiry -token"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data:user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Update user profile (fixed to update existing user, not create new)
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { username, email, number } = req.body;
    const updateFields = {};

    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (number) updateFields.number = number;

    const user = await User.findById(userId); // ✅ get the existing user
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Handle profile image upload
    if (req.file) {
      const imagePath = `/uploads/profileImages/${req.file.filename}`;
      updateFields.profileImage = imagePath;

      // Remove old image if exists
      if (user.profileImage) {
        const oldPath = path.join(process.cwd(), user.profileImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    // ✅ Update only existing user fields
    Object.assign(user, updateFields);
    await user.save();

    const updatedUser = await User.findById(userId).select(
      "-password -otp -otpExpiry -token"
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
