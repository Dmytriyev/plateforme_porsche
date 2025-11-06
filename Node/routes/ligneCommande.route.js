/*
  - Des routes pour vider le panier, récupérer les lignes du panier et modifier quantité.
  - Routes admin pour lecture complète des lignes.
*/
import { Router } from "express";
import {
  createLigneCommande,
  getAllLigneCommandes,
  getLigneCommandeById,
  updateLigneCommande,
  deleteLigneCommande,
  getLignesByCommande,
  getMesLignesPanier,
  viderPanier,
  updateQuantite,
} from "../controllers/ligneCommande.controller.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

// Routes admin
router.get("/all", auth, isAdmin, getAllLigneCommandes);
// Routes utilisateur
// panier
router.get("/panier", auth, getMesLignesPanier);
router.delete("/panier/vider", auth, viderPanier);
// commande
router.get(
  "/commande/:commandeId",
  auth,
  validateObjectId("commandeId"),
  getLignesByCommande
);
// ligne de commande
router.post("/new", auth, createLigneCommande);
router.get("/:id", auth, validateObjectId("id"), getLigneCommandeById);
router.put("/:id", auth, validateObjectId("id"), updateLigneCommande);
router.put("/:id/quantite", auth, validateObjectId("id"), updateQuantite);
router.delete("/:id", auth, validateObjectId("id"), deleteLigneCommande);

export default router;
