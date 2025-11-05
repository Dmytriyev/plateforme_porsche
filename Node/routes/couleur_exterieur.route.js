import { Router } from "express";
import {
  createCouleurExterieur,
  getAllCouleurExterieur,
  getCouleurExterieurById,
  updateCouleurExterieur,
  deleteCouleurExterieur,
} from "../controllers/couleur_exterieur.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";

const router = Router();

router.get("/all", getAllCouleurExterieur);
router.get("/:id", validateObjectId("id"), getCouleurExterieurById);

router.post(
  "/new",
  auth,
  isStaff,
  upload.single("name"),
  createCouleurExterieur
);
router.put(
  "/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  updateCouleurExterieur
);

router.delete(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteCouleurExterieur
);

export default router;
