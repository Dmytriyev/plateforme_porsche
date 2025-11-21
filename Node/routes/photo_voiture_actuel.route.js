import { Router } from "express";
import {
  createPhoto_voiture_actuel,
  getAllPhoto_voiture_actuels,
  getPhoto_voiture_actuelById,
  updatePhoto_voiture_actuel,
  deletePhoto_voiture_actuel,
} from "../controllers/photo_voiture_actuel.controller.js";
import optionalUpload from "../middlewares/optionalUpload.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";

const router = Router();

// Routes user authentifié
router.get("/all", auth, getAllPhoto_voiture_actuels);
router.get("/:id", auth, validateObjectId("id"), getPhoto_voiture_actuelById);
router.get(
  "/all/model_porsche_actuel/:modelId",
  getAllPhoto_voiture_actuels,
  validateObjectId("modelId")
);

router.post("/new", auth, optionalUpload, createPhoto_voiture_actuel);
router.put(
  "/update/:id",
  auth,
  validateObjectId("id"),
  optionalUpload,
  updatePhoto_voiture_actuel
);
router.delete(
  "/delete/:id",
  auth,
  validateObjectId("id"),
  deletePhoto_voiture_actuel
);

export default router;
