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
import validateObjectId from "../middlewares/validateObjectId.js";
import optionalUpload from "../middlewares/optionalUpload.js";

const router = Router();

// Routes pour `model_porsche_actuel` (préfixe: /api/model_porsche_actuel)
// GET  /all                 : auth required — Récupère tous les modèles actuels
router.get("/all", auth, getAllModel_porsche_actuels);
// GET  /search              : auth required — Rechercher des porsches selon critères
router.get("/search", auth, searchPorschesByCriteria);
// GET  /:id                 : auth required — Récupère un modèle par son id
router.get("/:id", auth, validateObjectId("id"), getModel_porsche_actuelById);
// POST /new                 : auth required — Créer un modèle Porsche actuel
router.post("/new", auth, createModel_porsche_actuel);
// GET  /user/mesPorsches     : auth required — Récupère les porsches du user connecté
router.get("/user/mesPorsches", auth, getMesPorsches);

router.put(
  "/update/:id",
  auth,
  validateObjectId("id"),
  optionalUpload,
  updateModel_porsche_actuel
);
// PATCH /addImages/:id      : auth required — Ajouter des images au modèle
router.patch("/addImages/:id", auth, validateObjectId("id"), addImages);
// PATCH /removeImages/:id   : auth required — Supprimer des images du modèle
router.patch("/removeImages/:id", auth, validateObjectId("id"), removeImages);
// PATCH /setCouleurExterieur/:id : auth required — Assigner couleur extérieure
router.patch(
  "/setCouleurExterieur/:id",
  auth,
  validateObjectId("id"),
  setCouleurExterieur
);
// PATCH /setCouleurInterieur/:id : auth required — Assigner couleur intérieure
router.patch(
  "/setCouleurInterieur/:id",
  auth,
  validateObjectId("id"),
  setCouleurInterieur
);
// PATCH /setTailleJante/:id : auth required — Assigner taille de jante
router.patch(
  "/setTailleJante/:id",
  auth,
  validateObjectId("id"),
  setTailleJante
);

router.delete(
  "/delete/:id",
  auth,
  validateObjectId("id"),
  deleteModel_porsche_actuel
);

export default router;
