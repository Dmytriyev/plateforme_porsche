import { Router } from "express";
import {
  createLigneCommande,
  getAllLigneCommandes,
  getLigneCommandeById,
  updateLigneCommande,
  deleteLigneCommande,
} from "../controllers/ligneCommande.controller.js";
import auth from "../middlewares/auth.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

router.post("/new", createLigneCommande);
router.get("/all", getAllLigneCommandes);
router.get("/:id", validateObjectId("id"), getLigneCommandeById);
router.put("/:id", validateObjectId("id"), updateLigneCommande);
router.delete("/:id", validateObjectId("id"), deleteLigneCommande);

export default router;
