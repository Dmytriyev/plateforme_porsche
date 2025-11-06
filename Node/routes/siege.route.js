/*
  - Public: lecture seule
  - Admin uniquement: création/édition/suppression
*/
import { Router } from "express";
import {
  createSiege,
  getAllSieges,
  getSiegeById,
  updateSiege,
  deleteSiege,
  getAvailableSiegeTypes,
} from "../controllers/siege.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = Router();
const optionalUpload = (req, res, next) => {
  // Si c'est multipart/form-data, utiliser multer
  if (req.is("multipart/form-data")) {
    return upload.single("photo_siege")(req, res, next);
  }
  // Sinon, body-parser gère le JSON
  next();
};
// Routes publiques
router.get("/all", getAllSieges);
router.get("/types", getAvailableSiegeTypes);
router.get("/:id", validateObjectId("id"), getSiegeById);

// Routes admin uniquement
router.post("/new", auth, isAdmin, optionalUpload, createSiege);
router.put(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  upload.single("photo_siege"),
  updateSiege
);
router.delete("/:id", auth, isAdmin, validateObjectId("id"), deleteSiege);

export default router;
