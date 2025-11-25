import { Router } from "express";
import {
  createModel_porsche_actuel,
  getAllModel_porsche_actuels,
  getModel_porsche_actuelById,
  updateModel_porsche_actuel,
  deleteModel_porsche_actuel,
  addImages,
  removeImages,
  getMesPorsches,
  setCouleurExterieur,
  setCouleurInterieur,
  setTailleJante,
  searchPorschesByCriteria,
} from "../controllers/model_porsche_actuel.controller.js";
import auth from "../middlewares/auth.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import optionalUpload from "../middlewares/optionalUpload.js";

const router = Router();

// user connecté
router.get("/all", auth, getAllModel_porsche_actuels);
router.get("/search", auth, searchPorschesByCriteria);
router.get("/:id", auth, validateObjectId("id"), getModel_porsche_actuelById);
router.post("/new", auth, createModel_porsche_actuel);
router.get("/user/mesPorsches", auth, getMesPorsches);

router.put(
  "/update/:id",
  auth,
  validateObjectId("id"),
  optionalUpload,
  updateModel_porsche_actuel,
);
router.patch("/addImages/:id", auth, validateObjectId("id"), addImages);
router.patch("/removeImages/:id", auth, validateObjectId("id"), removeImages);
router.patch(
  "/setCouleurExterieur/:id",
  auth,
  validateObjectId("id"),
  setCouleurExterieur,
);
router.patch(
  "/setCouleurInterieur/:id",
  auth,
  validateObjectId("id"),
  setCouleurInterieur,
);
router.patch(
  "/setTailleJante/:id",
  auth,
  validateObjectId("id"),
  setTailleJante,
);

router.delete(
  "/delete/:id",
  auth,
  validateObjectId("id"),
  deleteModel_porsche_actuel,
);

export default router;
