/*
  - publics pour lecture et recherche, 
  - staff/admin pour modification et suppression.
*/
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

const optionalUpload = (req, res, next) => {
  // Si c'est multipart/form-data, utiliser multer
  // Le champ "photo" correspond au nom du champ dans le formulaire multipart
  if (req.is("multipart/form-data")) {
    return upload.single("photo")(req, res, next);
  }
  // Sinon, body-parser gère le JSON
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
// Routes publiques
router.get("/all", getAllPhoto_voitures);
router.get("/search", getPhotosByCriteria);
router.get("/:id", validateObjectId("id"), getPhoto_voitureById);
// admin uniquement
router.delete(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deletePhoto_voiture
);

export default router;
