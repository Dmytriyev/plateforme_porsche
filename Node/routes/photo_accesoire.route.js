import { Router } from "express";
import {
  createPhoto_accesoire,
  getAllPhoto_accesoires,
  getPhoto_accesoireById,
  updatePhoto_accesoire,
  deletePhoto_accesoire,
} from "../controllers/photo_accesoire.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";

const router = Router();

// Middleware flexible pour accepter différents noms de champ
const optionalUpload = (req, res, next) => {
  // Si c'est multipart/form-data, utiliser multer
  if (req.is("multipart/form-data")) {
    return upload.single("photo")(req, res, next);
  }
  // Sinon, body-parser gère le JSON
  next();
};

// Routes staff
router.post("/new", auth, isStaff, optionalUpload, createPhoto_accesoire);
router.put(
  "/update/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  optionalUpload,
  updatePhoto_accesoire
);

// Routes publiques
router.get("/all", getAllPhoto_accesoires);
router.get(
  "/accesoire/:accesoireId",
  validateObjectId("accesoireId"),
  getAllPhoto_accesoires
);
router.get("/:id", validateObjectId("id"), getPhoto_accesoireById);

// Routes admin
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deletePhoto_accesoire
);

export default router;
