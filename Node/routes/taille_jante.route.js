import { Router } from "express";
import {
  createTaille_jante,
  getAllTaille_jantes,
  getTaille_janteById,
  updateTaille_jante,
  deleteTaille_jante,
  getAvailableJanteOptions,
} from "../controllers/taille_jante.controller.js";
import optionalUpload from "../middlewares/optionalUpload.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();

// ============================================
// ROUTES PUBLIQUES
// ============================================
router.get("/all", getAllTaille_jantes);
router.get("/options", getAvailableJanteOptions);
router.get("/:id", validateObjectId("id"), getTaille_janteById);

// ============================================
// ROUTES ADMIN
// ============================================
router.post("/new", auth, isAdmin, optionalUpload, createTaille_jante);
router.put(
  "/update/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  optionalUpload,
  updateTaille_jante
);
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteTaille_jante
);

export default router;
