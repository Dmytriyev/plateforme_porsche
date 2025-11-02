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

const router = Router();

// Routes publiques
router.get("/all", getAllTaille_jantes);
router.get("/:id", validateObjectId("id"), getTaille_janteById);

// Routes admin
router.post("/new", auth, isAdmin, upload.single("name"), createTaille_jante);
router.put("/:id", auth, isAdmin, validateObjectId("id"), updateTaille_jante);
router.delete(
  "/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteTaille_jante
);

export default router;
