import express from "express";
import { createCheckoutSession } from "../controllers/payment.controller.js";
const router = express.Router();
// Créer une session de paiement
router.post("/checkout/:id", createCheckoutSession);

export default router;
