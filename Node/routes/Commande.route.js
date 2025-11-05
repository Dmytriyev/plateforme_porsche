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
router.get("/all", auth, isAdmin, getAllCommandes); // Liste toutes les commandes

// Routes utilisateur - PANIER (workflow configurateur Porsche)
router.get("/panier", auth, getPanier); // Récupère le panier actif avec détails
router.get("/panier/get-or-create", auth, getOrCreatePanier); // Crée ou récupère le panier
router.post(
  "/panier/ajouter-configuration",
  auth,
  ajouterConfigurationAuPanier
); // Ajouter une config Porsche au panier
router.delete(
  "/panier/ligne/:ligne_id",
  auth,
  validateObjectId("ligne_id"),
  supprimerLignePanier
); // Supprimer une ligne du panier
router.put(
  "/panier/ligne/:ligne_id/quantite",
  auth,
  validateObjectId("ligne_id"),
  modifierQuantitePanier
); // Modifier quantité
router.post("/panier/valider", auth, validerPanier); // Valide le panier en commande (paiement acompte)

// Routes utilisateur - HISTORIQUE
router.get("/historique", auth, getMyCommandes); // Historique des commandes
router.post("/new", auth, createCommande);
router.get("/:id", auth, validateObjectId("id"), getCommandeById);
router.put("/:id", auth, validateObjectId("id"), updateCommande);
router.delete("/:id", auth, validateObjectId("id"), deleteCommande);

export default router;
