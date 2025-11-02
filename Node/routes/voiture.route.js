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
  getVoitureStats,
} from "../controllers/voiture.controller.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();

// Routes publiques (consultation)
router.get("/all", getAllVoitures);
router.get("/:id", validateObjectId("id"), getVoitureById);
router.get(
  "/:id/models-porsche",
  validateObjectId("id"),
  getModelsPorscheByVoiture
);
router.get("/:id/stats", validateObjectId("id"), getVoitureStats);

// Routes protégées (admin uniquement - CRUD)
router.post("/new", auth, isAdmin, createVoiture);
router.put("/:id", auth, isAdmin, validateObjectId("id"), updateVoiture);
router.delete("/:id", auth, isAdmin, validateObjectId("id"), deleteVoiture);

// Gestion des photos (admin uniquement)
router.put("/:id/images/add", auth, isAdmin, validateObjectId("id"), addImages);
router.put(
  "/:id/images/remove",
  auth,
  isAdmin,
  validateObjectId("id"),
  removeImages
);

export default router;
