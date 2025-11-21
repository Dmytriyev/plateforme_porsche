import { Router } from "express";
import {
  createPhoto_accesoire,
  getAllPhoto_accesoires,
  getPhoto_accesoireById,
  updatePhoto_accesoire,
  deletePhoto_accesoire,
} from "../controllers/photo_accesoire.controller.js";
import optionalUpload from "../middlewares/optionalUpload.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";

const router = Router();

// Routes staff
router.post("/new", auth, isStaff, optionalUpload, createPhoto_accesoire);
router.put(
  "/update/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  optionalUpload,
  updatePhoto_accesoire
);

// Routes publiques
router.get("/all", getAllPhoto_accesoires);
router.get(
  "/accesoire/:accesoireId",
  validateObjectId("accesoireId"),
  getAllPhoto_accesoires
);
router.get("/:id", validateObjectId("id"), getPhoto_accesoireById);

// Routes admin
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deletePhoto_accesoire
);

export default router;
