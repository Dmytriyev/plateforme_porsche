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
} from "../controllers/model_porsche.controller.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

// Routes de base
router.post("/new", createModel_porsche);
router.get("/all", getAllModel_porsches);
router.get("/:id", validateObjectId("id"), getModel_porscheById);
router.put("/:id", validateObjectId("id"), updateModel_porsche);
router.delete("/:id", validateObjectId("id"), deleteModel_porsche);

// Gestion des photos
router.put("/:id/images/add", validateObjectId("id"), addImages);
router.put("/:id/images/remove", validateObjectId("id"), removeImages);

// Gestion couleur extérieure (Many-to-One)
router.put(
  "/:id/couleur-exterieur/add",
  validateObjectId("id"),
  addCouleurExterieur
);
router.delete(
  "/:id/couleur-exterieur/remove",
  validateObjectId("id"),
  removeCouleurExterieur
);

// Gestion couleurs intérieures (Many-to-Many)
router.put(
  "/:id/couleurs-interieur/add",
  validateObjectId("id"),
  addCouleursInterieur
);
router.put(
  "/:id/couleurs-interieur/remove",
  validateObjectId("id"),
  removeCouleursInterieur
);

// Gestion taille de jante (Many-to-One)
router.put("/:id/taille-jante/add", validateObjectId("id"), addTailleJante);
router.delete(
  "/:id/taille-jante/remove",
  validateObjectId("id"),
  removeTailleJante
);

export default router;
