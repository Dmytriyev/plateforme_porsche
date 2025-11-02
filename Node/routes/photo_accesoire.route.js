import { Router } from "express";
import {
  createPhoto_accesoire,
  getAllPhoto_accesoires,
  getPhoto_accesoireById,
  updatePhoto_accesoire,
  deletePhoto_accesoire,
} from "../controllers/photo_accesoire.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();

// Routes publiques
router.get("/all", getAllPhoto_accesoires);
router.get("/:id", validateObjectId("id"), getPhoto_accesoireById);

// Routes admin
router.post(
  "/new",
  auth,
  isAdmin,
  upload.single("name"),
  createPhoto_accesoire
);
router.put(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  upload.single("name"),
  updatePhoto_accesoire
);
router.delete(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deletePhoto_accesoire
);

export default router;
