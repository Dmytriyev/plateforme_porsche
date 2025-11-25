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
import isStaff from "../middlewares/isStaff.js";
import optionalUpload from "../middlewares/optionalUpload.js";

const router = Router();

// ============================================
// ROUTES PUBLIQUES
// ============================================
router.get("/types", getAvailableTypesAccesoireOptions);
router.get("/all", getAllAccesoires);
router.get("/search", getAccesoiresByCriteria);
router.get("/:id", validateObjectId("id"), getAccesoireById);

// ============================================
// ROUTES STAFF (Création/Modification)
// ============================================
router.post("/new", auth, isStaff, optionalUpload, createAccesoire);
router.put(
  "/update/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  optionalUpload,
  updateAccesoire,
);

// Gestion des images
router.patch(
  "/addImage/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  optionalUpload,
  addImages,
);
router.patch(
  "/removeImages/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  removeImages,
);

// Gestion des couleurs (Many-to-One)
router.patch(
  "/addCouleur/:id",
  auth,
  isStaff,
  validateObjectId("id"), // id accesoire
  setCouleur,
);
router.patch(
  "/removeCouleur/:id",
  auth,
  isStaff,
  validateObjectId("id"), // id accesoire
  removeCouleur,
);
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"), // id accesoire
  deleteAccesoire,
);

export default router;
