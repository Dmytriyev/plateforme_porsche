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
  getAvailableTypesAccesoireOptions,
} from "../controllers/accesoire.controller.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();

// Routes publiques
router.get("/types", getAvailableTypesAccesoireOptions);
router.get("/all", getAllAccesoires);
router.get("/search", getAccessoiresByCriteria);
router.get("/:id", validateObjectId("id"), getAccesoireById);
// Routes admin uniquement
router.post("/new", auth, isAdmin, createAccesoire);
router.put("/:id", auth, isAdmin, validateObjectId("id"), updateAccesoire);
router.put("/:id/images/add", auth, isAdmin, validateObjectId("id"), addImages);
router.put(
  "/:id/images/remove",
  auth,
  isAdmin,
  validateObjectId("id"),
  removeImages
);
// Many-to-One
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
router.delete("/:id", auth, isAdmin, validateObjectId("id"), deleteAccesoire);

export default router;
