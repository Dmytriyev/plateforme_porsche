/*
  - Public: lecture, calcul prix, récupération des variantes et carrosseries
  - Admin uniquement: création/modification et gestion des relations (photos, couleurs, jantes), suppression
*/
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
  getConfigurationsByVoiture,
  getAllCarrosseries,
  getVariantesByVoitureModel,
  getAllVariantes,
} from "../controllers/model_porsche.controller.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";

const router = Router();

// Routes publiques
router.get("/carrosseries", getAllCarrosseries);
router.get("/variantes", getAllVariantes);
router.get("/variantes/:nomModel", getVariantesByVoitureModel);
router.get("/all", getAllModel_porsches);
router.get("/:id", validateObjectId("id"), getModel_porscheById);
router.get("/:id/prix-total", validateObjectId("id"), calculatePrixTotal);
router.get(
  "/par-voiture/:voiture_id",
  validateObjectId("voiture_id"),
  getConfigurationsByVoiture
);

// Routes staff (création/modification)
router.post("/new", auth, isStaff, createModel_porsche);
router.put("/:id", auth, isStaff, validateObjectId("id"), updateModel_porsche);
router.put("/:id/images/add", auth, isStaff, validateObjectId("id"), addImages);
router.delete(
  "/:id/images/remove",
  auth,
  isStaff,
  validateObjectId("id"),
  removeImages
);

router.put(
  "/:id/couleur-exterieur/add",
  auth,
  isStaff,
  validateObjectId("id"),
  addCouleurExterieur
);
router.delete(
  "/:id/couleur-exterieur/remove",
  auth,
  isStaff,
  validateObjectId("id"),
  removeCouleurExterieur
);

router.put(
  "/:id/couleurs-interieur/add",
  auth,
  isStaff,
  validateObjectId("id"),
  addCouleursInterieur
);
router.delete(
  "/:id/couleurs-interieur/remove",
  auth,
  isStaff,
  validateObjectId("id"),
  removeCouleursInterieur
);

router.put(
  "/:id/taille-jante/add",
  auth,
  isStaff,
  validateObjectId("id"),
  addTailleJante
);
router.delete(
  "/:id/taille-jante/remove",
  auth,
  isStaff,
  validateObjectId("id"),
  removeTailleJante
);

// Suppression admin uniquement
router.delete(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteModel_porsche
);

export default router;
