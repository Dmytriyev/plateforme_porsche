import { Router } from "express";
import {
  createLigneCommande,
  getAllLigneCommandes,
  getLigneCommandeById,
  updateLigneCommande,
  deleteLigneCommande,
} from "../controllers/ligneCommande.controller.js";
import auth from "../middlewares/auth.js";

const router = Router();

router.post("/new", auth, createLigneCommande);
router.get("/all", getAllLigneCommandes);
router.get("/:id", getLigneCommandeById);
router.put("/:id", updateLigneCommande);
router.delete("/:id", deleteLigneCommande);

export default router;
