import { Router } from "express";
import {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  getAvailablePackageTypes,
} from "../controllers/package.controller.js";
import optionalUpload from "../middlewares/optionalUpload.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();

// ============================================
// ROUTES PUBLIQUES
// ============================================
router.get("/types", getAvailablePackageTypes);
router.get("/all", getAllPackages);
router.get("/:id", validateObjectId("id"), getPackageById);

// ============================================
// ROUTES ADMIN
// ============================================
router.post("/new", auth, isAdmin, optionalUpload, createPackage);
router.put(
  "/update/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  optionalUpload,
  updatePackage
);
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deletePackage
);

export default router;
