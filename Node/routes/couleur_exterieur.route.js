import { Router } from "express";
import {
  createCouleur_exterieur,
  getAllCouleur_exterieurs,
  getCouleur_exterieurById,
  updateCouleur_exterieur,
  deleteCouleur_exterieur,
} from "../controllers/couleur_exterieur.controller.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.post("/new", upload.single("name"), createCouleur_exterieur);
router.get("/all", getAllCouleur_exterieurs);
router.get("/:id", getCouleur_exterieurById);
router.put("/:id", updateCouleur_exterieur);
router.delete("/:id", deleteCouleur_exterieur);

export default router;
