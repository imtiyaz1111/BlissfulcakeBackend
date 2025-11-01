import express from "express";
import { addAddress, getAddresses, updateAddress, deleteAddress } from "../controllers/addressController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

// ✅ Routes
router.post("/", isAuthenticated, addAddress);        // Add new address
router.get("/", isAuthenticated, getAddresses);       // Get all user addresses
router.put("/:id", isAuthenticated, updateAddress);   // Update address
router.delete("/:id", isAuthenticated, deleteAddress);// Delete address

export default router;
