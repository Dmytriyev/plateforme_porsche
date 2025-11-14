import { Router } from "express";
import {
  createTaille_jante,
  getAllTaille_jantes,
  getTaille_janteById,
  updateTaille_jante,
  deleteTaille_jante,
  getAvailableJanteOptions,
} from "../controllers/taille_jante.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();

// Middleware flexible pour accepter différents noms de champ
const optionalUpload = (req, res, next) => {
  // Si c'est multipart/form-data, utiliser multer
  if (req.is("multipart/form-data")) {
    // Accepter n'importe quel nom de champ pour la flexibilité
    return upload.any()(req, res, (err) => {
      if (err) return next(err);
      // chercher le premier fichier et le mettre dans req.file
      if (req.files && req.files.length > 0) {
        req.file = req.files[0];
        delete req.files; // Nettoyer pour garder la cohérence avec single()
      }
      next();
    });
  }
  // Sinon, body-parser gère le JSON
  next();
};

// Routes publiques
router.get("/all", getAllTaille_jantes);
router.get("/options", getAvailableJanteOptions);
router.get("/:id", validateObjectId("id"), getTaille_janteById);

// Routes admin
router.post("/new", auth, isAdmin, optionalUpload, createTaille_jante);
router.put(
  "/update/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  optionalUpload,
  updateTaille_jante
);
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteTaille_jante
);

export default router;
