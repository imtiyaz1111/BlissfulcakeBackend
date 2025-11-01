import express from "express";
import { createCheckoutSession, stripeWebhook } from "../controllers/paymentController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/create-checkout-session", isAuthenticated, createCheckoutSession);

// webhook route (no auth). We rely on server.js verify() that saved rawBody.
router.post("/webhook",express.raw({ type: "application/json" }), stripeWebhook);

export default router;
