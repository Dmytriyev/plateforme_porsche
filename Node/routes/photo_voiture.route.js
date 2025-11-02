import { Router } from "express";
import {
  createPhoto_voiture,
  getAllPhoto_voitures,
  getPhoto_voitureById,
  updatePhoto_voiture,
  deletePhoto_voiture,
  getPhotosByCriteria,
} from "../controllers/photo_voiture.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();

// Routes publiques (consultation)
router.get("/all", getAllPhoto_voitures);
router.get("/search", getPhotosByCriteria);
router.get("/:id", validateObjectId("id"), getPhoto_voitureById);

// Routes protégées (admin uniquement - CRUD)
router.post("/new", auth, isAdmin, upload.single("name"), createPhoto_voiture);
router.put(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  upload.single("name"),
  updatePhoto_voiture
);
router.delete(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deletePhoto_voiture
);

export default router;
