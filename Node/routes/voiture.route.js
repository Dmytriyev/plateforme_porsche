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

// ============================================
// ROUTES PUBLIQUES
// ============================================
// IMPORTANT: Routes spécifiques avant la route générique /:id

// Routes de liste et filtres
router.get("/all", getAllVoitures);
router.get("/neuve", getVoituresNeuves);
router.get("/occasion", getVoituresOccasionFinder);

// Routes avec paramètres spécifiques (avant /:id)
router.get("/page/:id", validateObjectId("id"), getVoiturePage);
router.get(
  "/modelsPorsche/:id",
  validateObjectId("id"),
  getModelsPorscheByVoiture,
);

// Route générique (en dernier)
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
  updateVoiture,
);
router.patch(
  "/addImages/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  optionalUpload,
  addImages,
);
router.patch(
  "/removeImages/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  optionalUpload,
  removeImages,
);

// Routes admin
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteVoiture,
);

export default router;
