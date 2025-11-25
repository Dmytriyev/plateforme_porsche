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

router.get("/all", auth, isAdmin, getAllCommandes);

router.get("/panier", auth, getPanier);
router.get("/panier/create", auth, getOrCreatePanier);
router.post("/panier/addConfig", auth, ajouterConfigurationAuPanier);
router.post("/panier/valider", auth, validerPanier);

// Gestion des lignes de panier - @DEPRECATED utilisez /api/panier/ligne/:id
router.delete(
  "/delete/ligne/:ligne_id",
  auth,
  validateObjectId("ligne_id"),
  supprimerLignePanier
);
router.patch(
  "/updateQuantite/ligne/:ligne_id",
  auth,
  validateObjectId("ligne_id"),
  modifierQuantitePanier
);

router.get("/historique", auth, getMyCommandes);
router.post("/new", auth, createCommande);
router.get("/:id", auth, validateObjectId("id"), getCommandeById);
router.put("/update/:id", auth, validateObjectId("id"), updateCommande);
router.delete("/delete/:id", auth, validateObjectId("id"), deleteCommande);

export default router;
