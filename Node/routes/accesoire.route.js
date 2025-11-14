import { Router } from "express";
import {
  createAccesoire,
  getAllAccesoires,
  getAccesoireById,
  updateAccesoire,
  deleteAccesoire,
  addImages,
  removeImages,
  setCouleur,
  removeCouleur,
  getAccesoiresByCriteria,
  getAvailableTypesAccesoireOptions,
} from "../controllers/accesoire.controller.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

// Middleware pour parser multipart/form-data et rendre req.body disponible
const optionalUpload = (req, res, next) => {
  if (!req.is("multipart/form-data")) return next();
  return upload.any()(req, res, (err) => {
    if (err) return next(err);
    // req.body est maintenant rempli avec les champs textuels
    next();
  });
};

// Routes publiques
router.get("/types", getAvailableTypesAccesoireOptions);
router.get("/all", getAllAccesoires);
router.get("/search", getAccesoiresByCriteria);
router.get("/:id", validateObjectId("id"), getAccesoireById);

// Routes admin uniquement
router.post("/new", auth, isAdmin, optionalUpload, createAccesoire);
router.put(
  "/update/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  optionalUpload,
  updateAccesoire
);
router.patch("/addImage/:id", auth, isAdmin, validateObjectId("id"), addImages);
router.patch(
  "/removeImages/:id",
  auth,
  isAdmin,
  validateObjectId("id"), // id accesoire
  removeImages
);
// Many-to-One
router.patch(
  "/addCouleur/:id",
  auth,
  isAdmin,
  validateObjectId("id"), // id accesoire
  setCouleur
);
router.patch(
  "/removeCouleur/:id",
  auth,
  isAdmin,
  validateObjectId("id"), // id accesoire
  removeCouleur
);
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"), // id accesoire
  deleteAccesoire
);

export default router;
