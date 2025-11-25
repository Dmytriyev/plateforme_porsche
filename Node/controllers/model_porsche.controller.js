/**
 * Contrôleur Model_porsche
 * - Gère les configurations de variantes Porsche : calculs de prix,
 *   validation des options et fourniture des variantes par modèle
 */
/**
 * Schéma Mongoose pour les configurations de modèles Porsche.
 * 1. USER visite voiture une model-start(911)
 * 2. USER choisit model_porsche une VARIANTE (Carrera, Carrera S, GTS, Turbo)
 * 3. Chaque variante a ses specs (puissance, transmission, accélération)
 * 4. USER configure: couleurs, jantes, sièges, package, options
 * 5. calcule prix total (prix_base_variante + options)
 * model_porsche = Configuration complète d'une variante spécifique
 */
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
import { anonymizeIp, formatTypeVoiture } from "../utils/log.utils.js";
import logger from "../utils/logger.js";

// Protection temporaire en mémoire pour éviter les logs dupliqués
// Clé = action:voitureId:clientIp  -> timestamp
const recentLogSuppress = new Map();

// (anonymizeIp and formatTypeVoiture moved to utils/log.utils.js)

// Champs pour les références dans Model_porsche
const POPULATE_FIELDS = {
  photo_porsche: "name alt couleur_exterieur couleur_interieur",
  voiture: "nom_model type_voiture description photo_voiture",
  couleur_exterieur: "nom_couleur photo_couleur prix",
  couleur_interieur: "nom_couleur photo_couleur prix",
  taille_jante: "taille_jante couleur_jante prix",
  package: "nom_package prix",
  siege: "nom_siege prix",
};

// Fonction pour valider l'existence d'une entité par son ID
const validateEntity = async (Model, id, entityName) => {
  // Rechercher l'entité par son ID dans le modèle spécifié
  const entity = await Model.findById(id);
  if (!entity) {
    // Lancer une erreur si l'entité n'existe pas
    throw new Error(`${entityName} introuvable`);
  }
  return entity;
};

// Fonction pour valider plusieurs entités par leurs IDs
const validateEntities = async (Model, ids, entityName) => {
  // Créer un tableau de promesses de validation pour chaque ID
  const validationPromises = ids.map((id) =>
    // Valider chaque entité individuellement
    validateEntity(Model, id, entityName)
  );
  await Promise.all(validationPromises);
};

// Fonction pour les références dans Model_porsche
const populateModel = (query) => {
  return query
    .populate({
      path: "photo_porsche",
      select: POPULATE_FIELDS.photo_porsche,
      populate: [
        {
          path: "couleur_exterieur",
          select: "_id nom_couleur",
        },
        {
          path: "couleur_interieur",
          select: "_id nom_couleur",
        },
      ],
    })
    .populate({
      path: "voiture",
      select: POPULATE_FIELDS.voiture,
      populate: {
        path: "photo_voiture",
        select: "name alt",
      },
    })
    .populate("couleur_exterieur", POPULATE_FIELDS.couleur_exterieur)
    .populate("couleur_interieur", POPULATE_FIELDS.couleur_interieur)
    .populate("taille_jante", POPULATE_FIELDS.taille_jante)
    .populate("package", POPULATE_FIELDS.package)
    .populate("siege", POPULATE_FIELDS.siege);
};

// Fonction pour calculer le prix total d'un modèle Porsche avec options
const calculatePrix = (model) => {
  // Calcul du prix de base de la variante
  const prixBase = model.prix_base || 0;
  // Calcul du prix de la couleur extérieure
  const prixCouleurExterieur = model.couleur_exterieur?.prix || 0;
  // Calcul du prix des couleurs intérieures
  const prixCouleursInterieur =
    model.couleur_interieur && Array.isArray(model.couleur_interieur)
      ? model.couleur_interieur.reduce(
          (total, couleur) => total + (couleur?.prix || 0),
          0
        )
      : 0;

  // Calcul du prix des autres options
  const prixJante = model.taille_jante?.prix || 0; // Calcul du prix des jantes
  const prixPackage = model.package?.prix || 0; // Calcul du prix du package
  const prixSiege = model.siege?.prix || 0; // Calcul du prix des sièges
  // Calcul du prix total et de l'acompte requis (10%)
  const prixTotal =
    prixBase +
    prixCouleurExterieur +
    prixCouleursInterieur +
    prixJante +
    prixPackage +
    prixSiege;
  const acompte = prixTotal * 0.1;
  return {
    // Prix de base de la variante
    prix_base_variante: prixBase,
    options: {
      couleur_exterieur: prixCouleurExterieur,
      couleurs_interieur: prixCouleursInterieur,
      jante: prixJante,
      package: prixPackage,
      siege: prixSiege,
    },
    // Somme des prix des options
    total_options:
      prixCouleurExterieur +
      prixCouleursInterieur +
      prixJante +
      prixPackage +
      prixSiege,
    prix_total: prixTotal,
    acompte_requis: acompte,
    pourcentage_acompte: "10%",
  };
};

// Créer une nouvelle configuration de modèle Porsche
const createModel_porsche = async (req, res) => {
  try {
    const { body } = req;
    // Vérifier si le corps de la requête est vide ou non défini
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = model_porscheValidation(body).model_porscheCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // Valider l'existence de la voiture associée
    await validateEntity(Voiture, body.voiture, "Voiture");
    // Valider que le prix de base est défini et supérieur à 0
    if (!body.prix_base || body.prix_base <= 0) {
      return res.status(400).json({
        message:
          "Le prix_base de la variante est requis et doit être supérieur à 0",
      });
    }
    // Valider l'existence de la couleur extérieure associée
    if (body.couleur_exterieur) {
      await validateEntity(
        Couleur_exterieur,
        body.couleur_exterieur,
        "Couleur extérieure"
      );
    }
    // Valider l'existence des couleurs intérieures associées
    if (body.couleur_interieur && Array.isArray(body.couleur_interieur)) {
      await validateEntities(
        Couleur_interieur,
        body.couleur_interieur,
        "Couleur intérieure"
      );
    }
    // Valider l'existence de la taille de jante associée
    if (body.taille_jante) {
      await validateEntity(Taille_jante, body.taille_jante, "Taille de jante");
    }
    // Valider l'existence des photos associées
    if (body.photo_porsche && Array.isArray(body.photo_porsche)) {
      await validateEntities(Photo_porsche, body.photo_porsche, "Photo");
    }
    // Créer et sauvegarder la nouvelle configuration de modèle Porsche
    const model_porsche = new Model_porsche(body);
    // Sauvegarder dans la base de données
    const newModel_porsche = await model_porsche.save();
    // Récupérer le modèle créé avec les références peuplées
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

// Récupérer toutes les configurations de modèles Porsche
const getAllModel_porsches = async (req, res) => {
  try {
    logger.info("getAllModel_porsches - start");

    // Récupérer sans populate d'abord pour debug
    const model_porsches = await Model_porsche.find()
      .populate("photo_porsche", "name alt")
      .populate("voiture", "nom_model type_voiture description")
      .populate("couleur_exterieur", "nom_couleur photo_couleur prix")
      .populate("couleur_interieur", "nom_couleur photo_couleur prix")
      .populate("taille_jante", "taille_jante couleur_jante prix")
      .populate("package", "nom_package prix")
      .populate("siege", "nom_siege prix")
      .sort({ createdAt: -1 })
      .lean();

    logger.info("Found models", { count: model_porsches.length });

    // Si pas de données, retourner un tableau vide
    if (!model_porsches || model_porsches.length === 0) {
      return sendSuccess(res, [], "Aucun modèle trouvé");
    }

    // Calculer le prix pour chaque modèle
    const model_porschesWithPrix = model_porsches.map((model) => {
      const prixBase = model.prix_base || 0;
      const prixCouleurExterieur = model.couleur_exterieur?.prix || 0;
      const prixCouleursInterieur = Array.isArray(model.couleur_interieur)
        ? model.couleur_interieur.reduce(
            (total, c) => total + (c?.prix || 0),
            0
          )
        : 0;
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

      return {
        ...model,
        prix_calcule: {
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
          acompte_requis: prixTotal * 0.1,
          pourcentage_acompte: "10%",
        },
      };
    });

    logger.info("Returning models with calculated prices", {
      count: model_porschesWithPrix.length,
    });
    return res.status(200).json(model_porschesWithPrix);
  } catch (error) {
    logger.error("Erreur getAllModel_porsches", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// Récupérer toutes les configurations pour une voiture spécifique
const getConfigurationsByVoiture = async (req, res) => {
  try {
    const voitureId = req.params.voiture_id;
    // Valider l'existence de la voiture spécifique
    const voiture = await validateEntity(
      Voiture,
      voitureId,
      "Gamme de voiture"
    );

    // Récupérer toutes les configurations associées à cette voiture avec les références
    const configurations = await populateModel(
      Model_porsche.find({ voiture: voitureId })
    ).sort({ prix_base: 1 }); // Trier par prix de base croissant

    // le nombre de configurations trouvées pour cette voiture
    try {
      // Inclure l'IP cliente dans la clé pour éviter logs répétés par même client
      const clientIp =
        req.ip ||
        (req.headers && req.headers["x-forwarded-for"]?.split(",")[0]) ||
        "unknown";
      const logKey = `getConfigurationsByVoiture:${voitureId}:${clientIp}`;
      const now = Date.now();
      const last = recentLogSuppress.get(logKey) || 0;
      // Ne pas répéter le même log pour la même voiture+client pendant 5s
      const SUPPRESSION_WINDOW_MS = 5000;
      // Si le dernier log est trop ancien, faire le log à nouveau
      if (now - last > SUPPRESSION_WINDOW_MS) {
        recentLogSuppress.set(logKey, now);
        // Nettoyage asynchrone pour éviter croissance mémoire
        setTimeout(
          () => recentLogSuppress.delete(logKey),
          SUPPRESSION_WINDOW_MS + 1000
        );
        // Faire le log des informations pertinentes (IP anonymisée, type formaté)
        const maskedIp = anonymizeIp(clientIp);
        const typeVoiture = formatTypeVoiture(voiture.type_voiture);
        logger.info(
          `[getConfigurationsByVoiture] voiture=${voitureId} (${voiture.nom_model}) type_voiture=${typeVoiture} total_configurations=${configurations.length} client_ip=${maskedIp}`
        );
      }
    } catch (err) {
      // Ne pas faire échouer la route pour un souci de logging
      logger.warn("Logging suppression check failed", { error: err.message });
    }

    // Calculer le prix pour chaque configuration et ajouter au résultat final
    const configurationsAvecPrix = configurations.map((config) => ({
      ...config.toObject(),
      prix_calcule: calculatePrix(config),
    }));
    // Retourner les configurations avec les détails de la voiture et le nombre total de configurations
    return res.status(200).json({
      voiture: {
        _id: voiture._id,
        nom_model: voiture.nom_model,
        type_voiture: voiture.type_voiture ? "neuve" : "occasion",
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

// Récupérer une configuration de modèle Porsche par son ID
const getModel_porscheById = async (req, res) => {
  try {
    const model_porsche = await populateModel(
      Model_porsche.findById(req.params.id)
    );
    if (!model_porsche) {
      return res.status(404).json({ message: "Variante Porsche n'existe pas" });
    }
    // Calculer le prix et l'ajouter à la réponse finale
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

// Mettre à jour une configuration de modèle Porsche par son ID
const updateModel_porsche = async (req, res) => {
  try {
    const { body } = req;
    // Vérifier si le corps de la requête est vide ou non défini
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = model_porscheValidation(body).model_porscheUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Valider l'existence du modèle Porsche à mettre à jour
    await validateEntity(Model_porsche, req.params.id, "Modèle Porsche");

    if (body.voiture) {
      await validateEntity(Voiture, body.voiture, "Voiture");
    }
    // Valider l'existence de la couleur extérieure associée
    if (body.couleur_exterieur) {
      await validateEntity(
        Couleur_exterieur,
        body.couleur_exterieur,
        "Couleur extérieure"
      );
    }
    // Valider l'existence des couleurs intérieures associées
    if (body.couleur_interieur && Array.isArray(body.couleur_interieur)) {
      await validateEntities(
        Couleur_interieur,
        body.couleur_interieur,
        "Couleur intérieure"
      );
    }
    // Valider l'existence de la taille de jante associée
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

// Supprimer une configuration de modèle Porsche par son ID
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

// Ajouter des images à une configuration de modèle Porsche existante
const addImages = async (req, res) => {
  try {
    const { body } = req;
    // Vérifier si le corps de la requête est vide ou non défini
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    // Valider les données d'ajout d'images
    const { error } =
      model_porscheValidation(body).model_porscheAddOrRemoveImage;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // Valider l'existence du modèle Porsche
    await validateEntity(Model_porsche, req.params.id, "Modèle Porsche");
    // Valider l'existence des photos à ajouter
    await validateEntities(Photo_porsche, body.photo_porsche, "Photo");

    // Mettre à jour le modèle Porsche en ajoutant les nouvelles photos sans doublons
    const updatedModel_porsche = await populateModel(
      Model_porsche.findByIdAndUpdate(
        req.params.id,
        // Ajouter les nouvelles photos sans doublons
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

// Supprimer des images d'une configuration de modèle Porsche existante
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

    // Mettre à jour le modèle Porsche en supprimant les photos spécifiées
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

// Ajouter une couleur extérieure à une configuration de modèle Porsche existante
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

    // Mettre à jour le modèle Porsche avec la nouvelle couleur extérieure
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

// Supprimer la couleur extérieure d'une configuration de modèle Porsche existante
const removeCouleurExterieur = async (req, res) => {
  try {
    await validateEntity(Model_porsche, req.params.id, "Modèle Porsche");

    // Mettre à jour le modèle Porsche en supprimant la couleur extérieure
    const updatedModel_porsche = await populateModel(
      Model_porsche.findByIdAndUpdate(
        req.params.id,
        // Supprimer la référence à la couleur extérieure
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

// Ajouter des couleurs intérieures à une configuration de modèle Porsche existante
const addCouleursInterieur = async (req, res) => {
  try {
    const { couleur_interieur } = req.body;
    if (!couleur_interieur || !Array.isArray(couleur_interieur)) {
      return res
        .status(400)
        .json({ message: "couleur_interieur (array) est requis" });
    }

    // Valider l'existence du modèle Porsche et des couleurs intérieures à ajouter
    await validateEntity(Model_porsche, req.params.id, "Modèle Porsche");
    await validateEntities(
      Couleur_interieur,
      couleur_interieur,
      "Couleur intérieure"
    );

    // Mettre à jour le modèle Porsche en ajoutant les nouvelles couleurs intérieures sans doublons
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

// Supprimer des couleurs intérieures d'une configuration de modèle Porsche existante
const removeCouleursInterieur = async (req, res) => {
  try {
    const { couleur_interieur } = req.body;
    // Vérifier que couleur_interieur est fourni et est un tableau
    if (!couleur_interieur || !Array.isArray(couleur_interieur)) {
      return res
        .status(400)
        .json({ message: "couleur_interieur doit être un tableau d'IDs" });
    }

    // Valider l'existence du modèle Porsche et des couleurs intérieures à supprimer
    await validateEntity(Model_porsche, req.params.id, "Modèle Porsche");
    await validateEntities(
      Couleur_interieur,
      couleur_interieur,
      "Couleur intérieure"
    );

    // Mettre à jour le modèle Porsche en supprimant les couleurs intérieures spécifiées
    const updatedModel_porsche = await populateModel(
      Model_porsche.findByIdAndUpdate(
        req.params.id,
        // Supprimer les couleurs intérieures spécifiées
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

// Ajouter une taille de jante à une configuration de modèle Porsche existante
const addTailleJante = async (req, res) => {
  try {
    const { taille_jante } = req.body;
    if (!taille_jante) {
      return res.status(400).json({ message: "taille_jante est requis" });
    }

    // Valider l'existence du modèle Porsche et de la taille de jante associée
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

// Supprimer la taille de jante d'une configuration de modèle Porsche existante
const removeTailleJante = async (req, res) => {
  try {
    await validateEntity(Model_porsche, req.params.id, "Modèle Porsche");

    // Mettre à jour le modèle Porsche en supprimant la taille de jante
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

// Calculer le prix total d'une configuration de modèle Porsche spécifique en fonction des options sélectionnées
const calculatePrixTotal = async (req, res) => {
  try {
    const model_porsche = await populateModel(
      Model_porsche.findById(req.params.id)
    );

    if (!model_porsche) {
      return res.status(404).json({ message: "Variante Porsche introuvable" });
    }
    // Calculer les détails du prix en fonction des options sélectionnées
    const detailsPrix = calculatePrix(model_porsche);
    // Retourner les détails du prix total calculé
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

// Récupère tous les types de carrosseries disponibles
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

// Récupère les variantes et carrosseries pour un modèle de voiture spécifique
const getVariantesByVoitureModel = async (req, res) => {
  try {
    const { nomModel } = req.params;

    // Vérifier si le modèle existe dans nos constantes
    if (!VARIANTES_PAR_MODELE[nomModel]) {
      return res.status(404).json({
        success: false,
        message: `Modèle "${nomModel}" non trouvé. Modèles disponibles: ${Object.keys(
          VARIANTES_PAR_MODELE
        ).join(", ")}`, // Liste des modèles disponibles
      });
    }

    // Récupérer les variantes et carrosseries pour le modèle spécifié
    const variantes = getVariantesByModel(nomModel);
    const carrosseries = getCarrosseriesByModel(nomModel);
    // Retourner les variantes et carrosseries
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

// Récupère toutes les variantes avec leurs modèles associés
const getAllVariantes = async (req, res) => {
  try {
    // Transformer les constantes en un format structuré pour la réponse API
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

// Récupère uniquement les voitures d'occasion disponibles
const getModelPorscheOccasions = async (req, res) => {
  try {
    // Récupérer toutes les voitures de type occasion (type_voiture = false)
    const voituresOccasion = await Voiture.find({ type_voiture: false });
    const voitureIds = voituresOccasion.map((v) => v._id);

    // Récupérer les model_porsche liés aux voitures d'occasion
    // Retirer le filtre disponible: true car il peut bloquer certaines occasions
    const occasions = await populateModel(
      Model_porsche.find({
        voiture: { $in: voitureIds },
      }).sort({ annee_production: -1 })
    );

    // Retourner les occasions avec leur prix fixe
    const occasionsWithPrix = occasions.map((model) => ({
      ...model.toObject(),
      prix_fixe: model.prix_base || model.prix,
      type: "occasion",
    }));

    return res.status(200).json({
      success: true,
      data: occasionsWithPrix,
      message: "Voitures d'occasion récupérées avec succès",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des voitures d'occasion",
      error: error.message,
    });
  }
};

// Récupère uniquement les voitures neuves (configurateur)
const getModelPorscheNeuves = async (req, res) => {
  try {
    // Récupérer toutes les voitures de type neuf (type_voiture = true)
    const voituresNeuves = await Voiture.find({ type_voiture: true });
    const voitureIds = voituresNeuves.map((v) => v._id);

    // Récupérer les model_porsche liés aux voitures neuves
    const neuves = await populateModel(
      Model_porsche.find({
        voiture: { $in: voitureIds },
        disponible: true,
      }).sort({ prix_base: 1 })
    );

    // Calculer le prix total pour chaque voiture neuve
    const neuvesWithPrix = neuves.map((model) => ({
      ...model.toObject(),
      prix_calcule: calculatePrix(model),
      type: "neuf",
    }));

    return res.status(200).json({
      success: true,
      data: neuvesWithPrix,
      message: "Voitures neuves récupérées avec succès",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des voitures neuves",
      error: error.message,
    });
  }
};

// Page explicative complète d'une variante model_porsche (GTS, GT3, GT4RS, etc.)
// Retourne toutes les informations nécessaires pour afficher une page détaillée de la variante
const getModelPorschePage = async (req, res) => {
  try {
    const modelId = req.params.id;

    // Récupérer la variante avec toutes ses relations
    const model_porsche = await populateModel(Model_porsche.findById(modelId));

    if (!model_porsche) {
      return res.status(404).json({
        success: false,
        message: "Variante Porsche introuvable",
      });
    }

    // Calculer le prix total avec options
    const prixCalcule = calculatePrix(model_porsche);

    // Vérifier si c'est une voiture neuve ou d'occasion
    const isNeuve = model_porsche.voiture?.type_voiture === true;

    // Formater les options sélectionnées
    const options = {
      couleur_exterieur: model_porsche.couleur_exterieur
        ? {
            _id: model_porsche.couleur_exterieur._id,
            nom: model_porsche.couleur_exterieur.nom_couleur,
            photo: model_porsche.couleur_exterieur.photo_couleur,
            prix: model_porsche.couleur_exterieur.prix || 0,
          }
        : null,
      couleurs_interieur:
        model_porsche.couleur_interieur &&
        Array.isArray(model_porsche.couleur_interieur)
          ? model_porsche.couleur_interieur.map((c) => ({
              _id: c._id,
              nom: c.nom_couleur,
              photo: c.photo_couleur,
              prix: c.prix || 0,
            }))
          : [],
      taille_jante: model_porsche.taille_jante
        ? {
            _id: model_porsche.taille_jante._id,
            taille: model_porsche.taille_jante.taille_jante,
            couleur: model_porsche.taille_jante.couleur_jante,
            prix: model_porsche.taille_jante.prix || 0,
          }
        : null,
      package: model_porsche.package
        ? {
            _id: model_porsche.package._id,
            nom: model_porsche.package.nom_package,
            prix: model_porsche.package.prix || 0,
          }
        : null,
      siege: model_porsche.siege
        ? {
            _id: model_porsche.siege._id,
            nom: model_porsche.siege.nom_siege,
            prix: model_porsche.siege.prix || 0,
          }
        : null,
    };

    // Formater la réponse pour la page explicative
    const pageData = {
      variante: {
        _id: model_porsche._id,
        nom_model: model_porsche.nom_model,
        type_carrosserie: model_porsche.type_carrosserie,
        annee_production: model_porsche.annee_production,
        description: model_porsche.description,
        statut: model_porsche.statut,
        disponible: model_porsche.disponible,
        numero_vin: model_porsche.numero_vin,
        concessionnaire: model_porsche.concessionnaire,
        createdAt: model_porsche.createdAt,
        updatedAt: model_porsche.updatedAt,
      },
      voiture_base: {
        _id: model_porsche.voiture?._id,
        nom_model: model_porsche.voiture?.nom_model,
        type_voiture: model_porsche.voiture?.type_voiture,
        description: model_porsche.voiture?.description,
      },
      specifications: {
        moteur: model_porsche.specifications?.moteur || "N/A",
        puissance: model_porsche.specifications?.puissance || 0,
        couple: model_porsche.specifications?.couple || 0,
        transmission: model_porsche.specifications?.transmission || "N/A",
        acceleration_0_100:
          model_porsche.specifications?.acceleration_0_100 || 0,
        vitesse_max: model_porsche.specifications?.vitesse_max || 0,
        consommation: model_porsche.specifications?.consommation || 0,
      },
      options: options,
      photos:
        model_porsche.photo_porsche &&
        Array.isArray(model_porsche.photo_porsche)
          ? model_porsche.photo_porsche.map((p) => ({
              _id: p._id,
              name: p.name,
              alt: p.alt,
            }))
          : [],
      prix: prixCalcule,
      type: isNeuve ? "neuf" : "occasion",
    };

    return res.status(200).json({
      success: true,
      data: pageData,
      message: `Page explicative de la ${model_porsche.nom_model} récupérée avec succès`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// Page explicative complète d'une voiture d'occasion
// Retourne toutes les informations nécessaires pour afficher une page détaillée de la voiture d'occasion
const getOccasionPage = async (req, res) => {
  try {
    const modelId = req.params.id;

    // Récupérer la variante avec toutes ses relations
    const model_porsche = await populateModel(Model_porsche.findById(modelId));

    if (!model_porsche) {
      return res.status(404).json({
        success: false,
        message: "Voiture d'occasion introuvable",
      });
    }

    // Vérifier que c'est bien une voiture d'occasion
    if (model_porsche.voiture?.type_voiture === true) {
      return res.status(400).json({
        success: false,
        message: "Cette voiture n'est pas une voiture d'occasion",
      });
    }

    // Calculer le prix fixe (pour les occasions, le prix est fixe)
    const prixFixe = model_porsche.prix_base || model_porsche.prix || 0;

    // Formater les options de la voiture d'occasion
    const options = {
      couleur_exterieur: model_porsche.couleur_exterieur
        ? {
            _id: model_porsche.couleur_exterieur._id,
            nom: model_porsche.couleur_exterieur.nom_couleur,
            photo: model_porsche.couleur_exterieur.photo_couleur,
          }
        : null,
      couleurs_interieur:
        model_porsche.couleur_interieur &&
        Array.isArray(model_porsche.couleur_interieur)
          ? model_porsche.couleur_interieur.map((c) => ({
              _id: c._id,
              nom: c.nom_couleur,
              photo: c.photo_couleur,
            }))
          : [],
      taille_jante: model_porsche.taille_jante
        ? {
            _id: model_porsche.taille_jante._id,
            taille: model_porsche.taille_jante.taille_jante,
            couleur: model_porsche.taille_jante.couleur_jante,
          }
        : null,
    };

    // Formater la réponse pour la page explicative de l'occasion
    const pageData = {
      occasion: {
        _id: model_porsche._id,
        nom_model: model_porsche.nom_model,
        type_carrosserie: model_porsche.type_carrosserie,
        annee_production: model_porsche.annee_production,
        description: model_porsche.description,
        statut: model_porsche.statut,
        disponible: model_porsche.disponible,
        numero_vin: model_porsche.numero_vin,
        concessionnaire: model_porsche.concessionnaire || "Centre Porsche",
        createdAt: model_porsche.createdAt,
        updatedAt: model_porsche.updatedAt,
      },
      voiture_base: {
        _id: model_porsche.voiture?._id,
        nom_model: model_porsche.voiture?.nom_model,
        description: model_porsche.voiture?.description,
      },
      specifications: {
        moteur: model_porsche.specifications?.moteur || "N/A",
        puissance: model_porsche.specifications?.puissance || 0,
        couple: model_porsche.specifications?.couple || 0,
        transmission: model_porsche.specifications?.transmission || "N/A",
        acceleration_0_100:
          model_porsche.specifications?.acceleration_0_100 || 0,
        vitesse_max: model_porsche.specifications?.vitesse_max || 0,
        consommation: model_porsche.specifications?.consommation || 0,
      },
      options: options,
      photos:
        model_porsche.photo_porsche &&
        Array.isArray(model_porsche.photo_porsche)
          ? model_porsche.photo_porsche.map((p) => ({
              _id: p._id,
              name: p.name,
              alt: p.alt,
            }))
          : [],
      prix: {
        prix_fixe: prixFixe,
        type: "occasion",
      },
    };

    return res.status(200).json({
      success: true,
      data: pageData,
      message: `Page explicative de la ${model_porsche.nom_model} d'occasion récupérée avec succès`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
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
  getModelPorscheOccasions,
  getModelPorscheNeuves,
  getModelPorschePage,
  getOccasionPage,
};
