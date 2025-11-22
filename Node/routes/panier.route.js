import express from "express";
import panierController from "../controllers/panier.controller.js";
import auth from "../middlewares/auth.js";
import validateRequest from "../middlewares/validateRequest.js";
import sanitizeInputs from "../middlewares/sanitizeInputs.js";

const router = express.Router();

/**
 * @route   POST /api/panier/voiture-neuve
 * @desc    Ajouter une voiture neuve au panier avec acompte (10%)
 * @access  Private (authentification requise)
 */
router.post(
  "/voiture-neuve",
  auth,
  sanitizeInputs,
  validateRequest,
  panierController.ajouterVoitureNeuveAuPanier
);

/**
 * @route   POST /api/panier/accessoire
 * @desc    Ajouter un accessoire au panier
 * @access  Private (authentification requise)
 */
router.post(
  "/accessoire",
  auth,
  sanitizeInputs,
  validateRequest,
  panierController.ajouterAccessoireAuPanier
);

/**
 * @route   GET /api/panier
 * @desc    Récupérer le panier de l'utilisateur connecté
 * @access  Private (authentification requise)
 */
router.get("/", auth, panierController.getPanier);

/**
 * @route   PATCH /api/panier/ligne/:ligne_id/quantite
 * @desc    Modifier la quantité d'une ligne de panier
 * @access  Private (authentification requise)
 */
router.patch(
  "/ligne/:ligne_id/quantite",
  auth,
  sanitizeInputs,
  validateRequest,
  panierController.modifierQuantiteLigne
);

/**
 * @route   DELETE /api/panier/ligne/:ligne_id
 * @desc    Supprimer une ligne du panier
 * @access  Private (authentification requise)
 */
router.delete("/ligne/:ligne_id", auth, panierController.supprimerLignePanier);

export default router;
