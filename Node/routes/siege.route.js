import { Router } from "express";
import {
  createSiege,
  getAllSieges,
  getSiegeById,
  updateSiege,
  deleteSiege,
  getAvailableSiegeTypes,
} from "../controllers/siege.controller.js";
import optionalUpload from "../middlewares/optionalUpload.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();

// ============================================
// ROUTES PUBLIQUES
// ============================================
router.get("/all", getAllSieges);
router.get("/types", getAvailableSiegeTypes);
router.get("/:id", validateObjectId("id"), getSiegeById);

// ============================================
// ROUTES ADMIN
// ============================================
router.post("/new", auth, isAdmin, optionalUpload, createSiege);
router.put(
  "/update/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  optionalUpload,
  updateSiege,
);
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteSiege,
);

export default router;
