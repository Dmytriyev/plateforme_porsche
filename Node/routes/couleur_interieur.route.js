import { Router } from "express";
import {
  createCouleur_interieur,
  getAllCouleur_interieurs,
  getCouleur_interieurById,
  updateCouleur_interieur,
  deleteCouleur_interieur,
} from "../controllers/couleur_interieur.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();

// Routes publiques (consultation)
router.get("/all", getAllCouleur_interieurs);
router.get("/:id", validateObjectId("id"), getCouleur_interieurById);

// Routes protégées (admin uniquement - CRUD)
router.post(
  "/new",
  auth,
  isAdmin,
  upload.single("name"),
  createCouleur_interieur
);
router.put(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  updateCouleur_interieur
);
router.delete(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteCouleur_interieur
);

export default router;
