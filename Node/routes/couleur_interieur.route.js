import { Router } from "express";
import {
  createCouleur_interieur,
  getAllCouleur_interieurs,
  getCouleur_interieurById,
  updateCouleur_interieur,
  deleteCouleur_interieur,
} from "../controllers/couleur_interieur.controller.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.post("/new", upload.single("name"), createCouleur_interieur);
router.get("/all", getAllCouleur_interieurs);
router.get("/:id", getCouleur_interieurById);
router.put("/:id", updateCouleur_interieur);
router.delete("/:id", deleteCouleur_interieur);

export default router;
