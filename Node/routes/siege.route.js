import { Router } from "express";
import {
  createSiege,
  getAllSieges,
  getSiegeById,
  updateSiege,
  deleteSiege,
  getAvailableSiegeTypes,
} from "../controllers/siege.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();

// Middleware flexible pour accepter différents noms de champ
const optionalUpload = (req, res, next) => {
  // Si ce n'est pas multipart/form-data, laisser le body-parser gérer
  if (!req.is("multipart/form-data")) return next();
  // Accepter n'importe quel nom de champ et normaliser vers req.file
  return upload.any()(req, res, (err) => {
    if (err) return next(err);
    if (req.files && req.files.length > 0) {
      // prendre le premier fichier (comportement semblable à single())
      req.file = req.files[0];
      delete req.files;
    }
    next();
  });
};

// Routes publiques
router.get("/all", getAllSieges);
router.get("/types", getAvailableSiegeTypes);
router.get("/:id", validateObjectId("id"), getSiegeById);

// Routes admin
router.post("/new", auth, isAdmin, optionalUpload, createSiege);
router.put(
  "/update/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  optionalUpload,
  updateSiege
);
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteSiege
);

export default router;
