import { Router } from "express";
import {
  createModel_porsche_actuel,
  getAllModel_porsche_actuels,
  getModel_porsche_actuelById,
  updateModel_porsche_actuel,
  deleteModel_porsche_actuel,
  addImages,
  removeImages,
  getMesPorsches,
  setCouleurExterieur,
  setCouleurInterieur,
  setTailleJante,
  searchPorschesByCriteria,
} from "../controllers/model_porsche_actuel.controller.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import validateObjectId from "../middlewares/validateObjectId.js";

const router = Router();

// Routes publiques
router.get("/all", getAllModel_porsche_actuels);
router.get("/search", searchPorschesByCriteria);
router.get("/:id", validateObjectId("id"), getModel_porsche_actuelById);

// Routes protégées - nécessitent authentification
router.post("/new", auth, createModel_porsche_actuel);
router.get("/user/mes-porsches", auth, getMesPorsches);
router.put("/:id", auth, validateObjectId("id"), updateModel_porsche_actuel);
router.delete("/:id", auth, validateObjectId("id"), deleteModel_porsche_actuel);
router.put("/:id/addImages", auth, validateObjectId("id"), addImages);
router.put("/:id/deleteImages", auth, validateObjectId("id"), removeImages);
router.put(
  "/:id/couleur-exterieur",
  auth,
  validateObjectId("id"),
  setCouleurExterieur
);
router.put(
  "/:id/couleur-interieur",
  auth,
  validateObjectId("id"),
  setCouleurInterieur
);
router.put("/:id/taille-jante", auth, validateObjectId("id"), setTailleJante);

export default router;
