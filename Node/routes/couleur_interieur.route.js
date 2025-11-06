/*
  - Public: lecture et récupération des couleurs
  - Admin uniquement: création/édition/suppression
*/
import { Router } from "express";
import {
  createCouleurInterieur,
  getAllCouleurInterieur,
  getCouleurInterieurById,
  updateCouleurInterieur,
  deleteCouleurInterieur,
  getAvailableCouleursInterieurOptions,
} from "../controllers/couleur_interieur.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

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
router.get("/couleurs", getAvailableCouleursInterieurOptions);
router.get("/all", getAllCouleurInterieur);
router.get("/:id", validateObjectId("id"), getCouleurInterieurById);

// Routes admin uniquement
router.post("/new", auth, isAdmin, optionalUpload, createCouleurInterieur);
router.put(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  updateCouleurInterieur
);
router.delete(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteCouleurInterieur
);

export default router;
