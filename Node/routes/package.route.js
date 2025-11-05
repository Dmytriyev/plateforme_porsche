import { Router } from "express";
import {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
} from "../controllers/package.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";

const router = Router();

// Routes publiques
router.get("/all", getAllPackages);
router.get("/:id", validateObjectId("id"), getPackageById);

// Routes staff (admin, responsable, conseillère)
router.post(
  "/new",
  auth,
  isStaff,
  upload.single("photo_package"),
  createPackage
);
router.put(
  "/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  upload.single("photo_package"),
  updatePackage
);

// Seul admin peut supprimer
router.delete("/:id", auth, isAdmin, validateObjectId("id"), deletePackage);

export default router;
