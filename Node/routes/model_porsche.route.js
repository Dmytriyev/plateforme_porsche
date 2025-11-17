/*
  - Public: lecture, calcul prix, récupération des variantes et carrosseries
  - Admin uniquement: création/modification et gestion des relations (photos, couleurs, jantes), suppression
*/
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
} from "../controllers/model_porsche.controller.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import auth from "../middlewares/auth.js";
import isAdmin from "../middlewares/isAdmin.js";
import isStaff from "../middlewares/isStaff.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

// Middleware flexible pour accepter multipart/form-data
const optionalUpload = (req, res, next) => {
  const contentType = req.headers && req.headers["content-type"];
  const isMultipart =
    contentType && contentType.includes("multipart/form-data");
  if (!isMultipart) return next();
  // Si c'est multipart/form-data, utiliser multer
  return upload.any()(req, res, (err) => {
    if (err) return next(err);
    // multer met les champs texte dans req.body et les fichiers dans req.files
    // Normaliser pour compatibilité : si un seul fichier, exposer req.file
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

// Routes publiques
router.get("/", getAllModel_porsches); // Route racine: tous les modèles Porsche
router.get("/carrosseries", getAllCarrosseries); // toutes carrosseries disponibles (SUV, Coupé, Cabriolet, etc.)
router.get("/variantes", getAllVariantes); // toutes variantes disponibles (ex: 911, Cayenne, Macan, etc.)
router.get("/variantes/:nomModel", getVariantesByVoitureModel); // ex: /variantes/911 (retourne toutes variantes de la 911)
router.get("/occasions", getModelPorscheOccasions); // modèles d'occasion
router.get("/neuves", getModelPorscheNeuves); // modèles neufs
router.get("/all", getAllModel_porsches); // tous les modèles Porsche (alias de la racine)
router.get("/prixTotal/:id", validateObjectId("id"), calculatePrixTotal); // calcul prix total avec options (couleurs, jantes, accessoires)
router.get(
  "/voiture/:voiture_id",
  validateObjectId("voiture_id"), // id de la voiture
  getConfigurationsByVoiture
); // récupérer configurations d'une voiture spécifique (avec couleurs, jantes, accessoires)
// Route paramétrée id (doit être après les routes plus spécifiques)
router.get("/:id", validateObjectId("id"), getModel_porscheById);

// Routes staff (création/modification)
router.post("/new", auth, isStaff, optionalUpload, createModel_porsche);
router.patch(
  "/update/:id",
  auth,
  isStaff,
  validateObjectId("id"), // id du modèle Porsche
  optionalUpload,
  updateModel_porsche
);
router.patch(
  "/addImages/:id",
  auth,
  isStaff,
  validateObjectId("id"), // id du modèle Porsche
  optionalUpload,
  addImages
);
router.patch(
  "/removeImages/:id",
  auth,
  isStaff,
  validateObjectId("id"), // id du modèle Porsche
  optionalUpload,
  removeImages
);

router.patch(
  "/addCouleurExterieur/:id",
  auth,
  isStaff,
  validateObjectId("id"), // id du modèle Porsche
  addCouleurExterieur
);
router.patch(
  "/removeCouleurExterieur/:id",
  auth,
  isStaff,
  validateObjectId("id"), // id du modèle Porsche
  removeCouleurExterieur
);

router.patch(
  "/addCouleursInterieur/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  addCouleursInterieur
);
router.patch(
  "/removeCouleursInterieur/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  removeCouleursInterieur
);

router.patch(
  "/addTailleJante/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  addTailleJante
);
router.patch(
  "/removeTailleJante/:id",
  auth,
  isStaff,
  validateObjectId("id"),
  removeTailleJante
);

// Suppression admin uniquement
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  validateObjectId("id"),
  deleteModel_porsche
);

export default router;
