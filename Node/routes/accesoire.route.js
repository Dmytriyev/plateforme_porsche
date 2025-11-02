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
  getAccessoiresByCriteria,
} from "../controllers/accesoire.controller.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();

// Routes publiques (consultation)
router.get("/all", getAllAccesoires);
router.get("/search", getAccessoiresByCriteria);
router.get("/:id", validateObjectId("id"), getAccesoireById);

// Routes protégées (admin uniquement - CRUD)
router.post("/new", auth, isAdmin, createAccesoire);
router.put("/:id", auth, isAdmin, validateObjectId("id"), updateAccesoire);
router.delete("/:id", auth, isAdmin, validateObjectId("id"), deleteAccesoire);

// Gestion des images (admin uniquement)
router.put("/:id/images/add", auth, isAdmin, validateObjectId("id"), addImages);
router.put(
  "/:id/images/remove",
  auth,
  isAdmin,
  validateObjectId("id"),
  removeImages
);

// Gestion de la couleur (admin uniquement - Many-to-One)
router.put(
  "/:id/couleur/set",
  auth,
  isAdmin,
  validateObjectId("id"),
  setCouleur
);
router.delete(
  "/:id/couleur/remove",
  auth,
  isAdmin,
  validateObjectId("id"),
  removeCouleur
);

export default router;
