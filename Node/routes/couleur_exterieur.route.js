import { Router } from "express";
import {
  createCouleurExterieur,
  getAllCouleurExterieur,
  getCouleurExterieurById,
  updateCouleurExterieur,
  deleteCouleurExterieur,
  getAvailableCouleursExterieurOptions,
} from "../controllers/couleur_exterieur.controller.js";
import optionalUpload from "../middlewares/optionalUpload.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";

const router = Router();

router.get("/couleurs", getAvailableCouleursExterieurOptions);
router.get("/all", getAllCouleurExterieur);
router.get("/:id", validateObjectId("id"), getCouleurExterieurById);

router.post("/new", auth, isStaff, optionalUpload, createCouleurExterieur);
router.put(
  "/update/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  optionalUpload,
  updateCouleurExterieur
);

router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteCouleurExterieur
);

export default router;
