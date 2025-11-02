import express from "express";
import { createCheckoutSession } from "../controllers/payment.controller.js";
import auth from "../middlewares/auth.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = express.Router();

// Route protégée - paiement nécessite authentification
router.post(
  "/checkout/:id",
  auth,
  validateObjectId("id"),
  createCheckoutSession
);

export default router;
