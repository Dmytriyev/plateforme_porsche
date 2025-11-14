import { Router } from "express";
import {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  getAvailablePackageTypes,
} from "../controllers/package.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();

// Middleware pour parser multipart/form-data et rendre req.body disponible
const optionalUpload = (req, res, next) => {
  // Si ce n'est pas multipart/form-data, laisser le body-parser gérer
  if (!req.is("multipart/form-data")) return next();
  // Accepter n'importe quel nom de champ et normaliser vers req.file
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

// Routes publiques
router.get("/types", getAvailablePackageTypes);
router.get("/all", getAllPackages);
router.get("/:id", validateObjectId("id"), getPackageById);

// Routes admin uniquement
router.post("/new", auth, isAdmin, optionalUpload, createPackage);
router.put(
  "/update/:id",
  auth,
  isAdmin,
  validateObjectId("id"), // id du package
  optionalUpload,
  updatePackage
);
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"), // id du package
  deletePackage
);

export default router;
