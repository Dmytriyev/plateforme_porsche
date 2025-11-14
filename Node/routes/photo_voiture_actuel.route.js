import { Router } from "express";
import {
  createPhoto_voiture_actuel,
  getAllPhoto_voiture_actuels,
  getPhoto_voiture_actuelById,
  updatePhoto_voiture_actuel,
  deletePhoto_voiture_actuel,
} from "../controllers/photo_voiture_actuel.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";

const router = Router();

// Middleware flexible pour accepter différents noms de champ
const optionalUpload = (req, res, next) => {
  // Si ce n'est pas multipart/form-data, laisser le body-parser gérer
  const contentType = req.headers && req.headers["content-type"];
  // Vérifier si le type de contenu est multipart/form-data
  const isMultipart =
    contentType && contentType.includes("multipart/form-data");
  // Si ce n'est pas multipart/form-data, laisser le body-parser gérer
  if (!isMultipart) return next();
  return upload.any()(req, res, (err) => {
    if (err) return next(err);
    // mettre le premier fichier dans req.file pour compatibilité
    if (req.files && req.files.length > 0) {
      // prendre le premier fichier
      req.file = req.files[0];
      delete req.files;
    }
    next();
  });
};

// Routes user authentifié
router.get("/all", auth, getAllPhoto_voiture_actuels);
router.get("/:id", auth, validateObjectId("id"), getPhoto_voiture_actuelById);
router.get(
  "/all/model_porsche_actuel/:modelId",
  getAllPhoto_voiture_actuels,
  validateObjectId("modelId")
);

router.post("/new", auth, optionalUpload, createPhoto_voiture_actuel);
router.put(
  "/update/:id",
  auth,
  validateObjectId("id"),
  optionalUpload,
  updatePhoto_voiture_actuel
);
router.delete(
  "/delete/:id",
  auth,
  validateObjectId("id"),
  deletePhoto_voiture_actuel
);

export default router;
