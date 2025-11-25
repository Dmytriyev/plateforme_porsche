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
  getVoiturePage,
} from "../controllers/voiture.controller.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";
import optionalUpload from "../middlewares/optionalUpload.js";

const router = Router();

// Routes pour `voiture` (préfixe: /api/voiture)
// GET  /all                  : public — Récupère toutes les voitures
router.get("/all", getAllVoitures);
// GET  /neuve                : public — Récupère les voitures neuves
router.get("/neuve", getVoituresNeuves);
// GET  /occasion             : public — Recherche de voitures d'occasion
router.get("/occasion", getVoituresOccasionFinder);

// GET  /page/:id             : public — Page paginée / détails public (param id)
router.get("/page/:id", validateObjectId("id"), getVoiturePage);
// GET  /modelsPorsche/:id    : public — Récupère les configurations modèles Porsche pour une voiture
router.get(
  "/modelsPorsche/:id",
  validateObjectId("id"),
  getModelsPorscheByVoiture
);

// GET  /:id                  : public — Récupère une voiture par son id (doit être en dernier)
router.get("/:id", validateObjectId("id"), getVoitureById);

// ============================================
// ROUTES STAFF (Création/Modification)
// ============================================
router.post("/new", auth, isStaff, optionalUpload, createVoiture);
router.put(
  "/update/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  optionalUpload,
  updateVoiture
);
router.patch(
  "/addImages/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  optionalUpload,
  addImages
);
router.patch(
  "/removeImages/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  optionalUpload,
  removeImages
);

// Routes admin
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteVoiture
);

export default router;
