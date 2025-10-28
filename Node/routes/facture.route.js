import { Router } from "express";
import {
  createFacture,
  getAllFactures,
  getFactureById,
  getFacturesByUser,
  updateFacture,
  searchFactures,
  deleteFacture,
} from "../controllers/facture.controller.js";
import auth from "../middlewares/auth.js";

const router = Router();

router.get("/all", getAllFactures);
router.get("/search", searchFactures);
router.post("/new", createFacture);
router.get("/user/:userId", getFacturesByUser);
router.get("/:id", getFactureById);
router.put("/:id", updateFacture);
router.delete("/:id", deleteFacture);

export default router;
