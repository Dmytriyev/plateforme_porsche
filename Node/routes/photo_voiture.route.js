import { Router } from "express";
import {
  createPhoto_voiture,
  getAllPhoto_voitures,
  getPhoto_voitureById,
  updatePhoto_voiture,
  deletePhoto_voiture,
  getPhotosByCriteria,
} from "../controllers/photo_voiture.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";

const router = Router();

// Routes publiques
router.get("/all", getAllPhoto_voitures);
router.get("/search", getPhotosByCriteria);
router.get("/:id", validateObjectId("id"), getPhoto_voitureById);
// Middleware pour gérer à la fois multipart et JSON
const optionalUpload = (req, res, next) => {
  // Si c'est multipart/form-data, utiliser multer
  if (req.is("multipart/form-data")) {
    return upload.single("name")(req, res, next);
  }
  // Sinon, continuer sans multer (body-parser gère le JSON)
  next();
};

// Routes staff (admin, responsable, conseillère)
router.post("/new", auth, isStaff, optionalUpload, createPhoto_voiture);
router.put(
  "/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  optionalUpload,
  updatePhoto_voiture
);
// Seul admin peut supprimer
router.delete(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deletePhoto_voiture
);

export default router;
