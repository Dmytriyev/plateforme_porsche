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
const optionalUpload = (req, res, next) => {
  // Si c'est multipart/form-data, utiliser multer
  if (req.is("multipart/form-data")) {
    return upload.single("photo")(req, res, next);
  }
  // Sinon, body-parser gère le JSON
  next();
};
// Routes user authentifié
router.get("/all", auth, getAllPhoto_voiture_actuels);
router.get("/:id", auth, validateObjectId("id"), getPhoto_voiture_actuelById);
router.post("/new", auth, optionalUpload, createPhoto_voiture_actuel);
router.put(
  "/:id",
  auth,
  validateObjectId("id"),
  optionalUpload,
  updatePhoto_voiture_actuel
);
router.delete("/:id", auth, validateObjectId("id"), deletePhoto_voiture_actuel);

export default router;
