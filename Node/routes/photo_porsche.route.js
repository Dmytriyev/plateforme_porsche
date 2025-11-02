import { Router } from "express";
import {
  createPhoto_porsche,
  getAllPhoto_porsches,
  getPhoto_porscheById,
  updatePhoto_porsche,
  deletePhoto_porsche,
} from "../controllers/photo_porsche.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();

// Routes publiques (consultation)
router.get("/all", getAllPhoto_porsches);
router.get("/:id", validateObjectId("id"), getPhoto_porscheById);

// Routes protégées (admin uniquement - CRUD)
router.post("/new", auth, isAdmin, upload.single("name"), createPhoto_porsche);
router.put(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  upload.single("name"),
  updatePhoto_porsche
);
router.delete(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deletePhoto_porsche
);

export default router;
