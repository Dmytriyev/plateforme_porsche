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
import { upload } from "../middlewares/multer.js";

const router = Router();

// Middleware flexible pour accepter multipart/form-data
const optionalUpload = (req, res, next) => {
  const contentType = req.headers && req.headers["content-type"];
  const isMultipart =
    contentType && contentType.includes("multipart/form-data");
  if (!isMultipart) return next();
  // Si c'est multipart/form-data, utiliser multer
  return upload.any()(req, res, (err) => {
    if (err) return next(err);
    // multer met les champs texte dans req.body et les fichiers dans req.files
    // Normaliser pour compatibilité : si un seul fichier, exposer req.file
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

// Routes publiques
router.get("/all", getAllVoitures);
router.get("/neuve", getVoituresNeuves);
router.get("/occasion", getVoituresOccasionFinder);
router.get("/page/:id", validateObjectId("id"), getVoiturePage); // Page explicative complète d'une voiture
router.get(
  "/modelsPorsche/:id",
  validateObjectId("id"), //id voiture
  getModelsPorscheByVoiture
); // Récupérer les modèles Porsche associés à une voiture
router.get("/:id", validateObjectId("id"), getVoitureById); // Récupérer une voiture par son ID

// Routes réservées au personnel
router.post("/new", auth, isStaff, optionalUpload, createVoiture);
router.put(
  "/update/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  optionalUpload,
  updateVoiture
);

// Routes réservées au personnel
router.patch(
  "/addImages/:id",
  auth,
  isStaff,
  validateObjectId("id"), //id voiture
  optionalUpload,
  addImages
);
router.patch(
  "/removeImages/:id",
  auth,
  isStaff,
  validateObjectId("id"), //id voiture
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
