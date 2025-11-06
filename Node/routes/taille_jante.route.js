/*
  - Public: lecture seule
  - Admin uniquement: création/édition/suppression 
*/
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
const optionalUpload = (req, res, next) => {
  // Si c'est multipart/form-data, utiliser multer
  if (req.is("multipart/form-data")) {
    return upload.single("photo_jante")(req, res, next);
  }
  // Sinon, body-parser gère le JSON
  next();
};
// Routes publiques
router.get("/all", getAllTaille_jantes);
router.get("/options", getAvailableJanteOptions);
router.get("/:id", validateObjectId("id"), getTaille_janteById);

// Routes admin uniquement
router.post("/new", auth, isAdmin, optionalUpload, createTaille_jante);
router.put("/:id", auth, isAdmin, validateObjectId("id"), updateTaille_jante);
router.delete(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteTaille_jante
);

export default router;
