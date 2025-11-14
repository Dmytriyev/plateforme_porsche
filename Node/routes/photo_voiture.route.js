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

// Middleware flexible pour accepter différents noms de champ (plus tolérant)
const optionalUpload = (req, res, next) => {
  // Si c'est multipart/form-data, utiliser multer.any() puis normaliser req.file
  if (req.is("multipart/form-data")) {
    return upload.any()(req, res, (err) => {
      if (err) return next(err);
      if (req.files && req.files.length > 0) {
        req.file = req.files[0];
      }
      return next();
    });
  }
  // Sinon, body-parser gère le JSON
  next();
};

// Routes staff
router.post("/new", auth, isStaff, optionalUpload, createPhoto_voiture);
router.put(
  "/update/:id",
  auth,
  isStaff,
  validateObjectId("id"), //id photo voiture
  optionalUpload,
  updatePhoto_voiture
);

// Routes publiques
router.get("/all", getAllPhoto_voitures);
router.get("/search", getPhotosByCriteria);
router.get("/:id", validateObjectId("id"), getPhoto_voitureById);
router.get(
  "/all/voiture/:modelId",
  getAllPhoto_voitures,
  validateObjectId("modelId")
);

// Routes admin
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"), //id photo voiture
  deletePhoto_voiture
);

export default router;
