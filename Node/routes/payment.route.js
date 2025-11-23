import express from "express";
import {
  createCheckoutSession,
  webhookHandler,
} from "../controllers/payment.controller.js";
import auth from "../middlewares/auth.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = express.Router();

// Route pour le webhook Stripe (DOIT être en raw body, sans auth)
// Cette route sera configurée dans server.js avec express.raw()
router.post("/webhook", webhookHandler);

// Route pour créer une session de paiement Stripe
router.post(
  "/checkout/:id",
  auth,
  validateObjectId("id"), // id de la commande
  createCheckoutSession
);

export default router;
