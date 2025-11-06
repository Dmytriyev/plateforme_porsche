/*
  - Public: lecture des gammes, variants, liste pour configurateur
  - Staff: création/modification et gestion des images (`isStaff`)
  - Admin: suppression (`isAdmin`)
  - routes appellent `model_porsche` via import dynamique pour éviter les dépendances circulaires.
*/
import { Router } from "express";
import {
  createVoiture,
  getAllVoitures,
  getVoitureById,
  updateVoiture,
  deleteVoiture,
  addImages,
  removeImages,
  getModelsPorscheByVoiture,
  getVoituresNeuves,
  getVoituresOccasionFinder,
} from "../controllers/voiture.controller.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";

const router = Router();
router.get("/all", getAllVoitures);
router.get("/neuves/configurateur", getVoituresNeuves);
router.get("/occasion/finder", getVoituresOccasionFinder);
router.get("/:id", validateObjectId("id"), getVoitureById);
router.get(
  "/:id/models-porsche",
  validateObjectId("id"),
  getModelsPorscheByVoiture
);

// Routes réservées au personnel (admin, responsable, conseillère)
router.post("/new", auth, isStaff, createVoiture);
router.put("/:id", auth, isStaff, validateObjectId("id"), updateVoiture);

// Routes réservées au personnel (admin, responsable, conseillère)
router.put("/:id/images/add", auth, isStaff, validateObjectId("id"), addImages);
router.put(
  "/:id/images/remove",
  auth,
  isStaff,
  validateObjectId("id"),
  removeImages
);

// Routes réservées uniquement aux administrateurs
router.delete("/:id", auth, isAdmin, validateObjectId("id"), deleteVoiture);

export default router;
