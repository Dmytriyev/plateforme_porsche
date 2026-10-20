import { Router } from "express";
import {
  createModel_porsche,
  getAllModel_porsches,
  getModel_porscheById,
  updateModel_porsche,
  deleteModel_porsche,
  addImages,
  removeImages,
  addCouleurExterieur,
  removeCouleurExterieur,
  addCouleursInterieur,
  removeCouleursInterieur,
  addTailleJante,
  removeTailleJante,
  calculatePrixTotal,
  getConfigurationsByVoiture,
  getAllCarrosseries,
  getVariantesByVoitureModel,
  getAllVariantes,
  getModelPorscheOccasions,
  getModelPorscheNeuves,
  getModelPorschePage,
  getOccasionPage,
} from "../controllers/model_porsche.controller.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";
import optionalUpload from "../middlewares/optionalUpload.js";

const router = Router();

// ============================================
// ROUTES PUBLIQUES
// ============================================
// IMPORTANT: Les routes spécifiques DOIVENT être avant la route générique /:id

// Route racine
router.get("/", getAllModel_porsches);

// Routes pour les catégories et filtres
router.get("/all", getAllModel_porsches); // Alias de la racine
router.get("/carrosseries", getAllCarrosseries); // Toutes carrosseries (SUV, Coupé, Cabriolet, etc.)
router.get("/variantes", getAllVariantes); // Toutes variantes (911, Cayenne, Macan, etc.)
router.get("/occasions", getModelPorscheOccasions); // Modèles d'occasion
router.get("/neuves", getModelPorscheNeuves); // Modèles neufs

// Routes avec paramètres spécifiques (avant /:id)
router.get("/variantes/:nomModel", getVariantesByVoitureModel); // Ex: /variantes/911
router.get("/prixTotal/:id", validateObjectId("id"), calculatePrixTotal); // Calcul prix total
router.get(
  "/voiture/:voiture_id",
  validateObjectId("voiture_id"),
  getConfigurationsByVoiture,
); // Configurations d'une voiture
router.get("/page/:id", validateObjectId("id"), getModelPorschePage); // Page complète variante
router.get("/occasion/page/:id", validateObjectId("id"), getOccasionPage); // Page complète occasion

// Route générique (DOIT être en dernier pour éviter conflits)
router.get("/:id", validateObjectId("id"), getModel_porscheById);

// Routes staff (création/modification)
router.post("/new", auth, isStaff, optionalUpload, createModel_porsche);
router.patch(
  "/update/:id",
  auth,
  isStaff,
  validateObjectId("id"), // id du modèle Porsche
  optionalUpload,
  updateModel_porsche,
);
router.patch(
  "/addImages/:id",
  auth,
  isStaff,
  validateObjectId("id"), // id du modèle Porsche
  optionalUpload,
  addImages,
);
router.patch(
  "/removeImages/:id",
  auth,
  isStaff,
  validateObjectId("id"), // id du modèle Porsche
  optionalUpload,
  removeImages,
);

router.patch(
  "/addCouleurExterieur/:id",
  auth,
  isStaff,
  validateObjectId("id"), // id du modèle Porsche
  addCouleurExterieur,
);
router.patch(
  "/removeCouleurExterieur/:id",
  auth,
  isStaff,
  validateObjectId("id"), // id du modèle Porsche
  removeCouleurExterieur,
);

router.patch(
  "/addCouleursInterieur/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  addCouleursInterieur,
);
router.patch(
  "/removeCouleursInterieur/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  removeCouleursInterieur,
);

router.patch(
  "/addTailleJante/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  addTailleJante,
);
router.patch(
  "/removeTailleJante/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  removeTailleJante,
);

// Suppression admin uniquement
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteModel_porsche,
);

export default router;
