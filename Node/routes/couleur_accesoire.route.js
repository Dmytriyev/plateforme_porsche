/*
  - Public: lecture
  - Staff (admin, responsable, conseillère): création/édition
  - Admin: suppression
*/
import { Router } from "express";
import {
  createCouleur_accesoire,
  getAllCouleur_accesoires,
  getCouleur_accesoireById,
  updateCouleur_accesoire,
  deleteCouleur_accesoire,
} from "../controllers/couleur_accesoire.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";

const router = Router();
const optionalUpload = (req, res, next) => {
  // Si c'est multipart/form-data, utiliser multer
  if (req.is("multipart/form-data")) {
    return upload.single("photo")(req, res, next);
  }
  // Sinon, body-parser gère le JSON
  next();
};
// Routes publiques
router.get("/all", getAllCouleur_accesoires);
router.get("/:id", validateObjectId("id"), getCouleur_accesoireById);
// Routes staff
router.post("/new", auth, isStaff, optionalUpload, createCouleur_accesoire);
router.put(
  "/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  updateCouleur_accesoire
);
// Routes admin uniquement
router.delete(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteCouleur_accesoire
);

export default router;
