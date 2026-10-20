import auth from "../middlewares/auth.js";
import express from "express";
import panierController from "../controllers/panier.controller.js";
import sanitizeInputs from "../middlewares/sanitizeInputs.js";
import validateRequest from "../middlewares/validateRequest.js";

const router = express.Router();

// Routes pour `panier` (préfixe: /api/panier)
// POST /voiture-neuve         : auth — Ajouter une voiture neuve au panier (acompte)
router.post(
  "/voiture-neuve",
  auth,
  sanitizeInputs,
  validateRequest,
  panierController.ajouterVoitureNeuveAuPanier
);

// POST /accessoire            : auth — Ajouter un accessoire au panier
router.post(
  "/accessoire",
  auth,
  sanitizeInputs,
  validateRequest,
  panierController.ajouterAccessoireAuPanier
);

// GET /                      : auth — Récupérer le panier de l'utilisateur connecté
router.get("/", auth, panierController.getPanier);

// PATCH /ligne/:ligne_id/quantite : auth — Modifier la quantité d'une ligne du panier
router.patch(
  "/ligne/:ligne_id/quantite",
  auth,
  sanitizeInputs,
  validateRequest,
  panierController.modifierQuantiteLigne
);

// DELETE /ligne/:ligne_id      : auth — Supprimer une ligne du panier
router.delete("/ligne/:ligne_id", auth, panierController.supprimerLignePanier);

export default router;
