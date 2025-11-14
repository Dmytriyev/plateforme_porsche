import { Router } from "express";
import {
  createCouleurExterieur,
  getAllCouleurExterieur,
  getCouleurExterieurById,
  updateCouleurExterieur,
  deleteCouleurExterieur,
  getAvailableCouleursExterieurOptions,
} from "../controllers/couleur_exterieur.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";

const router = Router();

// Middleware flexible pour accepter multipart/form-data
const optionalUpload = (req, res, next) => {
  // Si c'est multipart/form-data, utiliser multer
  if (req.is("multipart/form-data")) {
    return upload.single("photo")(req, res, next);
  }
  // Sinon, body-parser gère le JSON
  next();
};

// Routes publiques
router.get("/couleurs", getAvailableCouleursExterieurOptions);
router.get("/all", getAllCouleurExterieur);
router.get("/:id", validateObjectId("id"), getCouleurExterieurById);

// Routes staff
router.post("/new", auth, isStaff, optionalUpload, createCouleurExterieur);
router.put(
  "/update/:id",
  auth,
  isStaff,
  validateObjectId("id"), // id couleur extérieur
  optionalUpload,
  updateCouleurExterieur
);

// route admin
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteCouleurExterieur
);

export default router;
