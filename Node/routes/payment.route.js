import express from "express";
import { createCheckoutSession } from "../controllers/payment.controller.js";
import validateObjectId from "../middlewares/validateObjectId.js";
const router = express.Router();
router.post("/checkout/:id", validateObjectId("id"), createCheckoutSession);

export default router;
