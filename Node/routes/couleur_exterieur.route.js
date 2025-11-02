import { Router } from "express";
import {
  createCouleur_exterieur,
  getAllCouleur_exterieurs,
  getCouleur_exterieurById,
  updateCouleur_exterieur,
  deleteCouleur_exterieur,
} from "../controllers/couleur_exterieur.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();

// Routes publiques (consultation)
router.get("/all", getAllCouleur_exterieurs);
router.get("/:id", validateObjectId("id"), getCouleur_exterieurById);

// Routes protégées (admin uniquement - CRUD)
router.post(
  "/new",
  auth,
  isAdmin,
  upload.single("name"),
  createCouleur_exterieur
);
router.put(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  updateCouleur_exterieur
);
router.delete(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteCouleur_exterieur
);

export default router;
