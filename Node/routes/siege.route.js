import { Router } from "express";
import {
  createSiege,
  getAllSieges,
  getSiegeById,
  updateSiege,
  deleteSiege,
} from "../controllers/siege.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";

const router = Router();

// Routes publiques
router.get("/all", getAllSieges);
router.get("/:id", validateObjectId("id"), getSiegeById);

// Routes staff (admin, responsable, conseillère)
router.post("/new", auth, isStaff, upload.single("photo_siege"), createSiege);
router.put(
  "/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  upload.single("photo_siege"),
  updateSiege
);

// Seul admin peut supprimer
router.delete("/:id", auth, isAdmin, validateObjectId("id"), deleteSiege);

export default router;
