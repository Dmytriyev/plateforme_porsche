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
import isStaff from "../middlewares/isStaff.js";

const router = Router();

// Routes publiques
router.get("/all", getAllAccesoires);
router.get("/search", getAccessoiresByCriteria); // Recherche par critères
router.get("/:id", validateObjectId("id"), getAccesoireById);
// Routes staff (admin, responsable, conseillère)
router.post("/new", auth, isStaff, createAccesoire);
router.put("/:id", auth, isStaff, validateObjectId("id"), updateAccesoire);
router.put("/:id/images/add", auth, isStaff, validateObjectId("id"), addImages);
router.put(
  "/:id/images/remove",
  auth,
  isStaff,
  validateObjectId("id"),
  removeImages
);
// Many-to-One
router.put(
  "/:id/couleur/set",
  auth,
  isStaff,
  validateObjectId("id"),
  setCouleur
);
router.delete(
  "/:id/couleur/remove",
  auth,
  isStaff,
  validateObjectId("id"),
  removeCouleur
);
// Routes admin uniquement
router.delete("/:id", auth, isAdmin, validateObjectId("id"), deleteAccesoire);

export default router;
