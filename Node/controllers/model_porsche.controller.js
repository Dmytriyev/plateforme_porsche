// Controller: Model_porsche
// Gère les variantes/configurations Porsche pour une gamme de voitures.
// Fonctions principales : CRUD des variantes, ajout/suppression d'images, calcul du prix total
// Utilise des helpers pour valider les entités liées (voiture, couleurs, jantes, photos).
import Model_porsche from "../models/model_porsche.model.js";
import model_porscheValidation from "../validations/model_porsche.validation.js";
import Voiture from "../models/voiture.model.js";
import Couleur_exterieur from "../models/couleur_exterieur.model.js";
import Couleur_interieur from "../models/couleur_interieur.model.js";
import Taille_jante from "../models/taille_jante.model.js";
import Photo_porsche from "../models/photo_porsche.model.js";
import {
  getVariantesByModel,
  getAvailableCarrosseries,
  getCarrosseriesByModel,
  VARIANTES_PAR_MODELE,
} from "../utils/model_porsche.constants.js";

const POPULATE_FIELDS = {
  photo_porsche: "name alt",
  voiture: "nom_model type_voiture description",
  couleur_exterieur: "nom_couleur photo_couleur prix",
  couleur_interieur: "nom_couleur photo_couleur prix",
  taille_jante: "taille_jante couleur_jante prix",
  package: "nom_package prix",
  siege: "nom_siege prix",
};

const validateEntity = async (Model, id, entityName) => {
  const entity = await Model.findById(id);
  if (!entity) {
    throw new Error(`${entityName} introuvable`);
  }
  return entity;
};

const validateEntities = async (Model, ids, entityName) => {
  const validationPromises = ids.map((id) =>
    validateEntity(Model, id, entityName)
  );
  await Promise.all(validationPromises);
};

const populateModel = (query) => {
  return query
    .populate("photo_porsche", POPULATE_FIELDS.photo_porsche)
    .populate("voiture", POPULATE_FIELDS.voiture)
    .populate("couleur_exterieur", POPULATE_FIELDS.couleur_exterieur)
    .populate("couleur_interieur", POPULATE_FIELDS.couleur_interieur)
    .populate("taille_jante", POPULATE_FIELDS.taille_jante)
    .populate("package", POPULATE_FIELDS.package)
    .populate("siege", POPULATE_FIELDS.siege);
};

const calculatePrix = (model) => {
  const prixBase = model.prix_base || 0;
  let prixCouleurExterieur = model.couleur_exterieur?.prix || 0;

  let prixCouleursInterieur = 0;
  if (model.couleur_interieur && Array.isArray(model.couleur_interieur)) {
    prixCouleursInterieur = model.couleur_interieur.reduce(
      (total, couleur) => total + (couleur?.prix || 0),
      0
    );
  }

  const prixJante = model.taille_jante?.prix || 0;
  const prixPackage = model.package?.prix || 0;
  const prixSiege = model.siege?.prix || 0;
  const prixTotal =
    prixBase +
    prixCouleurExterieur +
    prixCouleursInterieur +
    prixJante +
    prixPackage +
    prixSiege;
  const acompte = prixTotal * 0.2;

  return {
    prix_base_variante: prixBase,
    options: {
      couleur_exterieur: prixCouleurExterieur,
      couleurs_interieur: prixCouleursInterieur,
      jante: prixJante,
      package: prixPackage,
      siege: prixSiege,
    },
    total_options:
      prixCouleurExterieur +
      prixCouleursInterieur +
      prixJante +
      prixPackage +
      prixSiege,
    prix_total: prixTotal,
    acompte_requis: acompte,
    pourcentage_acompte: "20%",
  };
};

const createModel_porsche = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = model_porscheValidation(body).model_porscheCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    await validateEntity(Voiture, body.voiture, "Voiture");

    if (!body.prix_base || body.prix_base <= 0) {
      return res.status(400).json({
        message:
          "Le prix_base de la variante est requis et doit être supérieur à 0",
      });
    }

    if (body.couleur_exterieur) {
      await validateEntity(
        Couleur_exterieur,
        body.couleur_exterieur,
        "Couleur extérieure"
      );
    }

    if (body.couleur_interieur && Array.isArray(body.couleur_interieur)) {
      await validateEntities(
        Couleur_interieur,
        body.couleur_interieur,
        "Couleur intérieure"
      );
    }

    if (body.taille_jante) {
      await validateEntity(Taille_jante, body.taille_jante, "Taille de jante");
    }

    if (body.photo_porsche && Array.isArray(body.photo_porsche)) {
      await validateEntities(Photo_porsche, body.photo_porsche, "Photo");
    }

    const model_porsche = new Model_porsche(body);
    const newModel_porsche = await model_porsche.save();

    const populatedModel = await populateModel(
      Model_porsche.findById(newModel_porsche._id)
    );

    return res.status(201).json({
      message: "Variante Porsche créée avec succès",
      model_porsche: populatedModel,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};

const getAllModel_porsches = async (req, res) => {
  try {
    const model_porsches = await populateModel(Model_porsche.find()).sort({
      annee_production: -1,
    });

    const model_porschesWithPrix = model_porsches.map((model) => ({
      ...model.toObject(),
      prix_calcule: calculatePrix(model),
    }));

    return res.status(200).json(model_porschesWithPrix);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};

const getConfigurationsByVoiture = async (req, res) => {
  try {
    const voitureId = req.params.voiture_id;

    const voiture = await validateEntity(
      Voiture,
      voitureId,
      "Gamme de voiture"
    );

    const configurations = await populateModel(
      Model_porsche.find({ voiture: voitureId })
    ).sort({ prix_base: 1 });

    const configurationsAvecPrix = configurations.map((config) => ({
      ...config.toObject(),
      prix_calcule: calculatePrix(config),
    }));

    return res.status(200).json({
      voiture: {
        _id: voiture._id,
        nom_model: voiture.nom_model,
        type_voiture: voiture.type_voiture,
        description: voiture.description,
      },
      nombre_configurations: configurationsAvecPrix.length,
      configurations: configurationsAvecPrix,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};

const getModel_porscheById = async (req, res) => {
  try {
    const model_porsche = await populateModel(
      Model_porsche.findById(req.params.id)
    );

    if (!model_porsche) {
      return res.status(404).json({ message: "Variante Porsche n'existe pas" });
    }

    const response = {
      ...model_porsche.toObject(),
      prix_calcule: calculatePrix(model_porsche),
    };

    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};

const updateModel_porsche = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = model_porscheValidation(body).model_porscheUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    await validateEntity(Model_porsche, req.params.id, "Modèle Porsche");

    if (body.voiture) {
      await validateEntity(Voiture, body.voiture, "Voiture");
    }

    if (body.couleur_exterieur) {
      await validateEntity(
        Couleur_exterieur,
        body.couleur_exterieur,
        "Couleur extérieure"
      );
    }

    if (body.couleur_interieur && Array.isArray(body.couleur_interieur)) {
      await validateEntities(
        Couleur_interieur,
        body.couleur_interieur,
        "Couleur intérieure"
      );
    }

    if (body.taille_jante) {
      await validateEntity(Taille_jante, body.taille_jante, "Taille de jante");
    }

    const updatedModel_porsche = await populateModel(
      Model_porsche.findByIdAndUpdate(req.params.id, body, { new: true })
    );

    if (!updatedModel_porsche) {
      return res.status(404).json({ message: "Variante Porsche n'existe pas" });
    }

    return res.status(200).json({
      message: "Variante Porsche mise à jour avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};

const deleteModel_porsche = async (req, res) => {
  try {
    const model_porsche = await Model_porsche.findByIdAndDelete(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: "Variante Porsche n'existe pas" });
    }
    return res
      .status(200)
      .json({ message: "Variante Porsche supprimée avec succès" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};

const addImages = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } =
      model_porscheValidation(body).model_porscheAddOrRemoveImage;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    await validateEntity(Model_porsche, req.params.id, "Modèle Porsche");
    await validateEntities(Photo_porsche, body.photo_porsche, "Photo");

    const updatedModel_porsche = await populateModel(
      Model_porsche.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { photo_porsche: { $each: body.photo_porsche } } },
        { new: true }
      )
    );

    return res.status(200).json({
      message: "Photos ajoutées avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};

const removeImages = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } =
      model_porscheValidation(body).model_porscheAddOrRemoveImage;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    await validateEntity(Model_porsche, req.params.id, "Modèle Porsche");
    await validateEntities(Photo_porsche, body.photo_porsche, "Photo");

    const updatedModel_porsche = await populateModel(
      Model_porsche.findByIdAndUpdate(
        req.params.id,
        { $pull: { photo_porsche: { $in: body.photo_porsche } } },
        { new: true }
      )
    );

    return res.status(200).json({
      message: "Photos supprimées avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};
const addCouleurExterieur = async (req, res) => {
  try {
    const { couleur_exterieur } = req.body;
    if (!couleur_exterieur) {
      return res.status(400).json({ message: "couleur_exterieur est requis" });
    }

    await validateEntity(Model_porsche, req.params.id, "Modèle Porsche");
    await validateEntity(
      Couleur_exterieur,
      couleur_exterieur,
      "Couleur extérieure"
    );

    const updatedModel_porsche = await populateModel(
      Model_porsche.findByIdAndUpdate(
        req.params.id,
        { couleur_exterieur },
        { new: true }
      )
    );

    return res.status(200).json({
      message: "Couleur extérieure ajoutée avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};

const removeCouleurExterieur = async (req, res) => {
  try {
    await validateEntity(Model_porsche, req.params.id, "Modèle Porsche");

    const updatedModel_porsche = await populateModel(
      Model_porsche.findByIdAndUpdate(
        req.params.id,
        { $unset: { couleur_exterieur: "" } },
        { new: true }
      )
    );

    return res.status(200).json({
      message: "Couleur extérieure supprimée avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};
const addCouleursInterieur = async (req, res) => {
  try {
    const { couleur_interieur } = req.body;
    if (!couleur_interieur || !Array.isArray(couleur_interieur)) {
      return res
        .status(400)
        .json({ message: "couleur_interieur (array) est requis" });
    }

    await validateEntity(Model_porsche, req.params.id, "Modèle Porsche");
    await validateEntities(
      Couleur_interieur,
      couleur_interieur,
      "Couleur intérieure"
    );

    const updatedModel_porsche = await populateModel(
      Model_porsche.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { couleur_interieur: { $each: couleur_interieur } } },
        { new: true }
      )
    );

    return res.status(200).json({
      message: "Couleurs intérieures ajoutées avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};

const removeCouleursInterieur = async (req, res) => {
  try {
    const { couleur_interieur } = req.body;
    if (!couleur_interieur || !Array.isArray(couleur_interieur)) {
      return res
        .status(400)
        .json({ message: "couleur_interieur doit être un tableau d'IDs" });
    }

    await validateEntity(Model_porsche, req.params.id, "Modèle Porsche");
    await validateEntities(
      Couleur_interieur,
      couleur_interieur,
      "Couleur intérieure"
    );

    const updatedModel_porsche = await populateModel(
      Model_porsche.findByIdAndUpdate(
        req.params.id,
        { $pull: { couleur_interieur: { $in: couleur_interieur } } },
        { new: true }
      )
    );

    return res.status(200).json({
      message: "Couleurs intérieures supprimées avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};
const addTailleJante = async (req, res) => {
  try {
    const { taille_jante } = req.body;
    if (!taille_jante) {
      return res.status(400).json({ message: "taille_jante est requis" });
    }

    await validateEntity(Model_porsche, req.params.id, "Modèle Porsche");
    await validateEntity(Taille_jante, taille_jante, "Taille de jante");

    const updatedModel_porsche = await populateModel(
      Model_porsche.findByIdAndUpdate(
        req.params.id,
        { taille_jante },
        { new: true }
      )
    );

    return res.status(200).json({
      message: "Taille de jante ajoutée avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};

const removeTailleJante = async (req, res) => {
  try {
    await validateEntity(Model_porsche, req.params.id, "Modèle Porsche");

    const updatedModel_porsche = await populateModel(
      Model_porsche.findByIdAndUpdate(
        req.params.id,
        { $unset: { taille_jante: "" } },
        { new: true }
      )
    );

    return res.status(200).json({
      message: "Taille de jante supprimée avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};
const calculatePrixTotal = async (req, res) => {
  try {
    const model_porsche = await populateModel(
      Model_porsche.findById(req.params.id)
    );

    if (!model_porsche) {
      return res.status(404).json({ message: "Variante Porsche introuvable" });
    }

    const detailsPrix = calculatePrix(model_porsche);

    return res.status(200).json({
      message: "Prix total calculé avec succès",
      gamme: model_porsche.voiture?.nom_model,
      variante: model_porsche.nom_model,
      model_id: model_porsche._id,
      details_prix: detailsPrix,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * Récupère tous les types de carrosserie disponibles
 * @route GET /api/model_porsche/carrosseries
 * @access Public
 */
const getAllCarrosseries = async (req, res) => {
  try {
    const carrosseries = getAvailableCarrosseries();
    return res.json({
      success: true,
      data: carrosseries,
      message: "Types de carrosserie récupérés avec succès",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des types de carrosserie",
      error: error.message,
    });
  }
};

/**
 * Récupère les variantes disponibles pour un modèle de voiture spécifique
 * @route GET /api/model_porsche/variantes/:nomModel
 * @access Public
 */
const getVariantesByVoitureModel = async (req, res) => {
  try {
    const { nomModel } = req.params;

    // Vérifier si le modèle existe dans nos constantes
    if (!VARIANTES_PAR_MODELE[nomModel]) {
      return res.status(404).json({
        success: false,
        message: `Modèle "${nomModel}" non trouvé. Modèles disponibles: ${Object.keys(
          VARIANTES_PAR_MODELE
        ).join(", ")}`,
      });
    }

    const variantes = getVariantesByModel(nomModel);
    const carrosseries = getCarrosseriesByModel(nomModel);

    return res.json({
      success: true,
      data: {
        modele: nomModel,
        variantes: variantes,
        carrosseries: carrosseries,
      },
      message: `Variantes et carrosseries pour ${nomModel} récupérées avec succès`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des variantes",
      error: error.message,
    });
  }
};

/**
 * Récupère toutes les variantes avec leurs modèles associés
 * @route GET /api/model_porsche/variantes
 * @access Public
 */
const getAllVariantes = async (req, res) => {
  try {
    const allVariantes = Object.entries(VARIANTES_PAR_MODELE).map(
      ([model, variantes]) => ({
        modele: model,
        variantes: variantes.map((v) => ({ value: v, label: v })),
      })
    );

    return res.json({
      success: true,
      data: allVariantes,
      message: "Toutes les variantes récupérées avec succès",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des variantes",
      error: error.message,
    });
  }
};

export {
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
};
