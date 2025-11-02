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
  getMesStatistiques,
} from "../controllers/Commande.controller.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

// Routes admin - AVANT les routes avec paramètres dynamiques
router.get("/all", auth, isAdmin, getAllCommandes);

// Routes protégées - nécessitent authentification
router.post("/new", auth, createCommande);
router.get("/panier", auth, getPanier);
router.get("/panier/get-or-create", auth, getOrCreatePanier);
router.post("/panier/valider", auth, validerPanier);
router.get("/historique", auth, getMyCommandes);
router.get("/statistiques", auth, getMesStatistiques);
router.get("/:id", auth, validateObjectId("id"), getCommandeById);
router.put("/:id", auth, validateObjectId("id"), updateCommande);
router.delete("/:id", auth, validateObjectId("id"), deleteCommande);

export default router;
