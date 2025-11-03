import { Router } from "express";
import {
  createModel_porsche,
  getAllModel_porsches,
  getModel_porscheById,
  updateModel_porsche,
  deleteModel_porsche,
  addImages,
  removeImages,
  addCouleurExterieur,
  removeCouleurExterieur,
  addCouleursInterieur,
  removeCouleursInterieur,
  addTailleJante,
  removeTailleJante,
  calculatePrixTotal,
  getModel_porscheWithPrixTotal,
} from "../controllers/model_porsche.controller.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();

// Routes publiques (consultation)
router.get("/all", getAllModel_porsches);
router.get("/:id", validateObjectId("id"), getModel_porscheById);
// Nouvelles routes pour le calcul de prix
router.get("/:id/prix-total", validateObjectId("id"), calculatePrixTotal);
router.get(
  "/:id/details-complet",
  validateObjectId("id"),
  getModel_porscheWithPrixTotal
);

// Routes protégées (admin uniquement - CRUD)
router.post("/new", auth, isAdmin, createModel_porsche);
router.put("/:id", auth, isAdmin, validateObjectId("id"), updateModel_porsche);
router.delete(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteModel_porsche
);

// Gestion des photos (admin uniquement)
router.put("/:id/images/add", auth, isAdmin, validateObjectId("id"), addImages);
router.put(
  "/:id/images/remove",
  auth,
  isAdmin,
  validateObjectId("id"),
  removeImages
);

// Gestion couleur extérieure (admin uniquement - Many-to-One)
router.put(
  "/:id/couleur-exterieur/add",
  auth,
  isAdmin,
  validateObjectId("id"),
  addCouleurExterieur
);
router.delete(
  "/:id/couleur-exterieur/remove",
  auth,
  isAdmin,
  validateObjectId("id"),
  removeCouleurExterieur
);

// Gestion couleurs intérieures (admin uniquement - Many-to-Many)
router.put(
  "/:id/couleurs-interieur/add",
  auth,
  isAdmin,
  validateObjectId("id"),
  addCouleursInterieur
);
router.put(
  "/:id/couleurs-interieur/remove",
  auth,
  isAdmin,
  validateObjectId("id"),
  removeCouleursInterieur
);

// Gestion taille de jante (admin uniquement - Many-to-One)
router.put(
  "/:id/taille-jante/add",
  auth,
  isAdmin,
  validateObjectId("id"),
  addTailleJante
);
router.delete(
  "/:id/taille-jante/remove",
  auth,
  isAdmin,
  validateObjectId("id"),
  removeTailleJante
);

export default router;
