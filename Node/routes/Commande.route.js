import { Router } from "express";
import {
  createCommande,
  getAllCommandes,
  getCommandeById,
  updateCommande,
  deleteCommande,
  getMyCommandes,
  getPanier,
  getOrCreatePanier,
  validerPanier,
  ajouterConfigurationAuPanier,
  supprimerLignePanier,
  modifierQuantitePanier,
} from "../controllers/Commande.controller.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

// Routes admin
router.get("/all", auth, isAdmin, getAllCommandes);

// Routes utilisateur panier
router.get("/panier", auth, getPanier);
router.get("/panier/get-or-create", auth, getOrCreatePanier);
router.post(
  "/panier/ajouter-configuration",
  auth,
  ajouterConfigurationAuPanier
);
router.delete(
  "/panier/ligne/:ligne_id",
  auth,
  validateObjectId("ligne_id"),
  supprimerLignePanier
);
router.put(
  "/panier/ligne/:ligne_id/quantite",
  auth,
  validateObjectId("ligne_id"),
  modifierQuantitePanier
);
router.post("/panier/valider", auth, validerPanier);
// Route historique
router.get("/historique", auth, getMyCommandes);
// Route commande
router.post("/new", auth, createCommande);
router.get("/:id", auth, validateObjectId("id"), getCommandeById);
router.put("/:id", auth, validateObjectId("id"), updateCommande);
router.delete("/:id", auth, validateObjectId("id"), deleteCommande);

export default router;
