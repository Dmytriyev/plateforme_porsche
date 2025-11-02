import { Router } from "express";
import {
  createCouleur_accesoire,
  getAllCouleur_accesoires,
  getCouleur_accesoireById,
  updateCouleur_accesoire,
  deleteCouleur_accesoire,
} from "../controllers/couleur_accesoire.controller.js";
import { upload } from "../middlewares/multer.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

router.post("/new", upload.single("name"), createCouleur_accesoire);
router.get("/all", getAllCouleur_accesoires);
router.get("/:id", validateObjectId("id"), getCouleur_accesoireById);
router.put("/:id", validateObjectId("id"), updateCouleur_accesoire);
router.delete("/:id", validateObjectId("id"), deleteCouleur_accesoire);

export default router;
