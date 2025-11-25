import { Router } from "express";
import {
  createCouleur_accesoire,
  getAllCouleur_accesoires,
  getCouleur_accesoireById,
  updateCouleur_accesoire,
  deleteCouleur_accesoire,
} from "../controllers/couleur_accesoire.controller.js";
import optionalUpload from "../middlewares/optionalUpload.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";

const router = Router();

// Routes publiques
router.get("/all", getAllCouleur_accesoires);
router.get("/:id", validateObjectId("id"), getCouleur_accesoireById);

// Routes staff
router.post("/new", auth, isStaff, optionalUpload, createCouleur_accesoire);
router.put(
  "/update/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  optionalUpload,
  updateCouleur_accesoire,
);

// Routes admin
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteCouleur_accesoire,
);

export default router;
