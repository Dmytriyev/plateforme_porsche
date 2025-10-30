import { Router } from "express";
import {
  createCommande,
  getAllCommandes,
  getCommandeById,
  updateCommande,
  deleteCommande,
  getMyCommandes,
  getPanier,
} from "../controllers/Commande.controller.js";
import auth from "../middlewares/auth.js";

const router = Router();

router.post("/new", createCommande);
router.get("/panier", getPanier);
router.get("/all", getAllCommandes);
router.get("/historique", getMyCommandes);
router.get("/:id", getCommandeById);
router.put("/:id", updateCommande);
router.delete("/:id", deleteCommande);

export default router;
