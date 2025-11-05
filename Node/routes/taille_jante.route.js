import { Router } from "express";
import {
  createTaille_jante,
  getAllTaille_jantes,
  getTaille_janteById,
  updateTaille_jante,
  deleteTaille_jante,
} from "../controllers/taille_jante.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";

const router = Router();

// Routes publiques
router.get("/all", getAllTaille_jantes);
router.get("/:id", validateObjectId("id"), getTaille_janteById);
// Routes staff (admin, responsable, conseillère)
router.post("/new", auth, isStaff, upload.single("name"), createTaille_jante);
router.put("/:id", auth, isStaff, validateObjectId("id"), updateTaille_jante);
// Seul admin peut supprimer
router.delete(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteTaille_jante
);

export default router;
