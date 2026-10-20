import { Router } from "express";
import {
  createCouleurInterieur,
  getAllCouleurInterieur,
  getCouleurInterieurById,
  updateCouleurInterieur,
  deleteCouleurInterieur,
  getAvailableCouleursInterieurOptions,
} from "../controllers/couleur_interieur.controller.js";
import optionalUpload from "../middlewares/optionalUpload.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();

router.get("/couleurs", getAvailableCouleursInterieurOptions);
router.get("/all", getAllCouleurInterieur);
router.get("/:id", validateObjectId("id"), getCouleurInterieurById);

router.post("/new", auth, isAdmin, optionalUpload, createCouleurInterieur);
router.put(
  "/update/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  optionalUpload,
  updateCouleurInterieur
);
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteCouleurInterieur
);

export default router;
