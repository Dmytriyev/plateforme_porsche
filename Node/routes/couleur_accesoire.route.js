import { Router } from "express";
import {
  createCouleur_accesoire,
  getAllCouleur_accesoires,
  getCouleur_accesoireById,
  updateCouleur_accesoire,
  deleteCouleur_accesoire,
} from "../controllers/couleur_accesoire.controller.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.post("/new", upload.single("name"), createCouleur_accesoire);
router.get("/all", getAllCouleur_accesoires);
router.get("/:id", getCouleur_accesoireById);
router.put("/:id", updateCouleur_accesoire);
router.delete("/:id", deleteCouleur_accesoire);

export default router;
