import { Router } from "express";
import {
  createCouleurInterieur,
  getAllCouleurInterieur,
  getCouleurInterieurById,
  updateCouleurInterieur,
  deleteCouleurInterieur,
} from "../controllers/couleur_interieur.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";

const router = Router();

router.get("/all", getAllCouleurInterieur);
router.get("/:id", validateObjectId("id"), getCouleurInterieurById);

router.post(
  "/new",
  auth,
  isStaff,
  upload.single("name"),
  createCouleurInterieur
);
router.put(
  "/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  updateCouleurInterieur
);

router.delete(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteCouleurInterieur
);

export default router;
