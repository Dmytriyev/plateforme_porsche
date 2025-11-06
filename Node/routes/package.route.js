import { Router } from "express";
import {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  getAvailablePackageTypes,
} from "../controllers/package.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();
const optionalUpload = (req, res, next) => {
  // Si c'est multipart/form-data, utiliser multer
  if (req.is("multipart/form-data")) {
    return upload.single("photo_package")(req, res, next);
  }
  // Sinon, body-parser gère le JSON
  next();
};
// Routes publiques
router.get("/types", getAvailablePackageTypes);
router.get("/all", getAllPackages);
router.get("/:id", validateObjectId("id"), getPackageById);

// Routes admin uniquement
router.post("/new", auth, isAdmin, optionalUpload, createPackage);
router.put(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  upload.single("photo_package"),
  updatePackage
);
router.delete("/:id", auth, isAdmin, validateObjectId("id"), deletePackage);

export default router;
