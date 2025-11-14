import express from "express";
import { createCheckoutSession } from "../controllers/payment.controller.js";
import auth from "../middlewares/auth.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = express.Router();

// Route pour créer une session de paiement Stripe
router.post(
  "/checkout/:id",
  auth,
  validateObjectId("id"), // id de la commande
  createCheckoutSession
);

export default router;
