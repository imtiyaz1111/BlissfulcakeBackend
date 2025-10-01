import express from "express";
import {
  createContact,
  getContacts,
  getContactById,
  deleteContact,
} from "../controllers/contactController.js";

const router = express.Router();

// POST: Create Contact
router.post("/", createContact);

// GET: All Contacts
router.get("/", getContacts);

// GET: Single Contact
router.get("/:id", getContactById);

// DELETE: Contact
router.delete("/:id", deleteContact);

export default router;
