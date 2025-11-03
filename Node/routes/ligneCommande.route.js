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

// ===== Routes admin =====
router.get("/all", auth, isAdmin, getAllLigneCommandes); // Liste toutes les lignes

// ===== Routes utilisateur (auth requise) =====
// Gestion du panier
router.get("/panier", auth, getMesLignesPanier); // Lignes du panier actif
router.delete("/panier/vider", auth, viderPanier); // Vider le panier

// Consultation par commande
router.get(
  "/commande/:commandeId",
  auth,
  validateObjectId("commandeId"),
  getLignesByCommande
);

// CRUD ligne de commande
router.post("/new", auth, createLigneCommande);
router.get("/:id", auth, validateObjectId("id"), getLigneCommandeById);
router.put("/:id", auth, validateObjectId("id"), updateLigneCommande);
router.put("/:id/quantite", auth, validateObjectId("id"), updateQuantite); // Modifier quantité
router.delete("/:id", auth, validateObjectId("id"), deleteLigneCommande);

export default router;
