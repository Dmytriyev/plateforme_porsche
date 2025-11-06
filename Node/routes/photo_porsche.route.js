/*
  - Public: lecture seule
  - Staff: upload/édition
  - Admin: suppression
*/
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
import isStaff from "../middlewares/isStaff.js";

const router = Router();

const optionalUpload = (req, res, next) => {
  // Si c'est multipart/form-data, utiliser multer
  if (req.is("multipart/form-data")) {
    return upload.single("photo")(req, res, next);
  }
  // Sinon, body-parser gère le JSON
  next();
};
// Routes staff (admin, responsable, conseillère)
router.post("/new", auth, isStaff, optionalUpload, createPhoto_porsche);
router.put(
  "/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  optionalUpload,
  updatePhoto_porsche
);
// Routes publiques
router.get("/all", getAllPhoto_porsches);
router.get("/:id", validateObjectId("id"), getPhoto_porscheById);
// Seul admin peut supprimer
router.delete(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deletePhoto_porsche
);

export default router;
