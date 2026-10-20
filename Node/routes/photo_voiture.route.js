import { Router } from "express";
import {
  createPhoto_voiture,
  getAllPhoto_voitures,
  getPhoto_voitureById,
  updatePhoto_voiture,
  deletePhoto_voiture,
  getPhotosByCriteria,
} from "../controllers/photo_voiture.controller.js";
import optionalUpload from "../middlewares/optionalUpload.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";

const router = Router();

// Routes staff
router.post("/new", auth, isStaff, optionalUpload, createPhoto_voiture);
router.put(
  "/update/:id",
  auth,
  isStaff,
  validateObjectId("id"), //id photo voiture
  optionalUpload,
  updatePhoto_voiture,
);

// Routes publiques
router.get("/all", getAllPhoto_voitures);
router.get("/search", getPhotosByCriteria);
router.get("/:id", validateObjectId("id"), getPhoto_voitureById);
router.get(
  "/all/voiture/:modelId",
  getAllPhoto_voitures,
  validateObjectId("modelId"),
);

// Routes admin
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"), //id photo voiture
  deletePhoto_voiture,
);

export default router;
