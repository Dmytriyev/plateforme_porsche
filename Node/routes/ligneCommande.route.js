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
  getStatistiquesLignes,
} from "../controllers/ligneCommande.controller.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

// Routes admin - AVANT les routes avec paramètres dynamiques
router.get("/all", auth, isAdmin, getAllLigneCommandes);
router.get("/statistiques/all", auth, isAdmin, getStatistiquesLignes);

// Routes protégées - nécessitent authentification
router.post("/new", auth, createLigneCommande);
router.get("/panier", auth, getMesLignesPanier);
router.delete("/panier/vider", auth, viderPanier);
router.get(
  "/commande/:commandeId",
  auth,
  validateObjectId("commandeId"),
  getLignesByCommande
);
router.get("/:id", auth, validateObjectId("id"), getLigneCommandeById);
router.put("/:id", auth, validateObjectId("id"), updateLigneCommande);
router.put("/:id/quantite", auth, validateObjectId("id"), updateQuantite);
router.delete("/:id", auth, validateObjectId("id"), deleteLigneCommande);

export default router;
