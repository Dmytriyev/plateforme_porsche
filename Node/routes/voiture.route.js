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
// Routes publiques - accessible à tous
router.get("/all", getAllVoitures);
// Route configurateur: affiche voitures neuves avec infos agrégées depuis model_porsche
// (comme /model-start sur configurateur.porsche.com)
router.get("/neuves/configurateur", getVoituresNeuves);
// Route finder occasion: affiche voitures occasion style Porsche Approved
// Filtres: ?modele=911&carrosserie=Targa&annee_min=2017&annee_max=2021&prix_max=150000
router.get("/occasion/finder", getVoituresOccasionFinder);
router.get("/:id", validateObjectId("id"), getVoitureById);
router.get(
  "/:id/models-porsche",
  validateObjectId("id"),
  getModelsPorscheByVoiture
);

// Routes réservées au personnel (admin, responsable, conseillère)
// Seul le staff peut créer et modifier des voitures
router.post("/new", auth, isStaff, createVoiture);
router.put("/:id", auth, isStaff, validateObjectId("id"), updateVoiture);

// Routes réservées au personnel (admin, responsable, conseillère)
// Seul le staff peut gérer les photos
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
