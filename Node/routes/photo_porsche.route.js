import { Router } from "express";
import {
  createPhoto_porsche,
  getAllPhoto_porsches,
  getPhoto_porscheById,
  updatePhoto_porsche,
  deletePhoto_porsche,
} from "../controllers/photo_porsche.controller.js";
import optionalUpload from "../middlewares/optionalUpload.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";

const router = Router();

// Routes staff
router.post("/new", auth, isStaff, optionalUpload, createPhoto_porsche);
router.put(
  "/update/:id",
  auth,
  isStaff,
  validateObjectId("id"), // id de la photo Porsche
  optionalUpload,
  updatePhoto_porsche,
);

// Routes publiques
router.get("/all", getAllPhoto_porsches);
router.get("/:id", validateObjectId("id"), getPhoto_porscheById);
router.get(
  "/all/model_porsche/:modelId",
  getAllPhoto_porsches,
  validateObjectId("modelId"),
);

// Routes admin
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deletePhoto_porsche,
);

export default router;
