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

const router = Router();

// Routes de base
router.post("/new", createVoiture);
router.get("/all", getAllVoitures);
router.get("/:id", validateObjectId("id"), getVoitureById);
router.put("/:id", validateObjectId("id"), updateVoiture);
router.delete("/:id", validateObjectId("id"), deleteVoiture);

// Gestion des photos
router.put("/:id/images/add", validateObjectId("id"), addImages);
router.put("/:id/images/remove", validateObjectId("id"), removeImages);

// Relations avec model_porsche
router.get(
  "/:id/models-porsche",
  validateObjectId("id"),
  getModelsPorscheByVoiture
);

// Statistiques
router.get("/:id/stats", validateObjectId("id"), getVoitureStats);

export default router;
