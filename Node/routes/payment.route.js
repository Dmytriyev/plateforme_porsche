import express from "express";
import { createCheckoutSession } from "../controllers/payment.controller.js";
const router = express.Router();
router.post("/checkout/:id", createCheckoutSession);

export default router;
