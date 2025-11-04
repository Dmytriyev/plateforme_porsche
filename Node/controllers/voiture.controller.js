import Voiture from "../models/voiture.model.js";
import voitureValidation from "../validations/voiture.validation.js";
import Photo from "../models/photo_voiture.model.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils/responses.js";

/**
 * Créer une nouvelle voiture (admin uniquement)
 */
const createVoiture = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const { error } = voitureValidation(body).voitureCreate;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }

    // Vérifier que les photos existent si fournies
    if (body.photo_voiture && Array.isArray(body.photo_voiture)) {
      for (let photoId of body.photo_voiture) {
        const photo = await Photo.findById(photoId);
        if (!photo) {
          return sendNotFound(res, `La photo ${photoId} n'existe pas`);
        }
      }
    }

    const voiture = new Voiture(body);
    const newVoiture = await voiture.save();

    const populatedVoiture = await Voiture.findById(newVoiture._id).populate(
      "photo_voiture",
      "name alt"
    );

    return sendSuccess(
      res,
      { voiture: populatedVoiture },
      "Voiture créée avec succès",
      201
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

/**
 * Récupérer toutes les voitures (public)
 */
const getAllVoitures = async (req, res) => {
  try {
    const voitures = await Voiture.find()
      .populate("photo_voiture", "name alt")
      .sort({ createdAt: -1 })
      .lean(); // Retourne des objets JS purs (30-50% plus rapide)

    return sendSuccess(res, voitures);
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

/**
 * Récupérer une voiture par ID (public)
 */
const getVoitureById = async (req, res) => {
  try {
    const voiture = await Voiture.findById(req.params.id)
      .populate("photo_voiture", "name alt")
      .lean(); // Retourne un objet JS pur

    if (!voiture) {
      return sendNotFound(res, "Voiture introuvable");
    }

    return sendSuccess(res, voiture);
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

/**
 * Mettre à jour une voiture (admin uniquement)
 */
const updateVoiture = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const { error } = voitureValidation(body).voitureUpdate;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }

    const voitureExist = await Voiture.findById(req.params.id);
    if (!voitureExist) {
      return sendNotFound(res, "Voiture introuvable");
    }

    const { photo_voiture, ...otherData } = body;
    let updateQuery = otherData;

    // Si des photos sont fournies, vérifier qu'elles existent et utiliser $addToSet
    if (
      photo_voiture &&
      Array.isArray(photo_voiture) &&
      photo_voiture.length > 0
    ) {
      for (let photoId of photo_voiture) {
        const photo = await Photo.findById(photoId);
        if (!photo) {
          return sendNotFound(res, `La photo ${photoId} n'existe pas`);
        }
      }
      updateQuery = {
        ...otherData,
        $addToSet: { photo_voiture: { $each: photo_voiture } },
      };
    }

    const updatedVoiture = await Voiture.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      { new: true }
    ).populate("photo_voiture", "name alt");

    if (!updatedVoiture) {
      return sendNotFound(res, "Voiture introuvable");
    }

    return sendSuccess(
      res,
      { voiture: updatedVoiture },
      "Voiture mise à jour avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

/**
 * Supprimer une voiture (admin uniquement)
 */
const deleteVoiture = async (req, res) => {
  try {
    const voiture = await Voiture.findByIdAndDelete(req.params.id);
    if (!voiture) {
      return sendNotFound(res, "Voiture introuvable");
    }

    return sendSuccess(res, null, "Voiture supprimée avec succès");
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

/**
 * Ajouter des photos à une voiture (admin uniquement)
 */
const addImages = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const { error } = voitureValidation(body).voitureAddOrRemoveImage;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }

    const voiture = await Voiture.findById(req.params.id);
    if (!voiture) {
      return sendNotFound(res, `La voiture ${req.params.id} n'existe pas`);
    }

    // Vérifier que les photos existent
    for (let photo_voitureId of body.photo_voiture) {
      const photo_voiture = await Photo.findById(photo_voitureId);
      if (!photo_voiture) {
        return sendNotFound(res, `La photo ${photo_voitureId} n'existe pas`);
      }
    }

    // $addToSet évite les doublons
    const updatedVoiture = await Voiture.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { photo_voiture: { $each: body.photo_voiture } } },
      { new: true }
    ).populate("photo_voiture", "name alt");

    return sendSuccess(
      res,
      { voiture: updatedVoiture },
      "Photos ajoutées avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

/**
 * Supprimer des photos d'une voiture (admin uniquement)
 */
const removeImages = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const { error } = voitureValidation(body).voitureAddOrRemoveImage;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }

    const voiture = await Voiture.findById(req.params.id);
    if (!voiture) {
      return sendNotFound(res, `La voiture ${req.params.id} n'existe pas`);
    }

    // Vérifier que les photos existent
    for (let photo_voitureId of body.photo_voiture) {
      const photo_voiture = await Photo.findById(photo_voitureId);
      if (!photo_voiture) {
        return sendNotFound(res, `La photo ${photo_voitureId} n'existe pas`);
      }
    }

    const updatedVoiture = await Voiture.findByIdAndUpdate(
      req.params.id,
      { $pull: { photo_voiture: { $in: body.photo_voiture } } },
      { new: true }
    ).populate("photo_voiture", "name alt");

    return sendSuccess(
      res,
      { voiture: updatedVoiture },
      "Photos supprimées avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

/**
 * Récupérer tous les modèles Porsche associés à une voiture (public)
 */
const getModelsPorscheByVoiture = async (req, res) => {
  try {
    const voiture = await Voiture.findById(req.params.id);
    if (!voiture) {
      return sendNotFound(res, "Voiture introuvable");
    }

    // Import dynamique pour éviter les dépendances circulaires
    const Model_porsche = (await import("../models/model_porsche.model.js"))
      .default;

    const models_porsche = await Model_porsche.find({ voiture: req.params.id })
      .populate("photo_porsche", "name alt")
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante")
      .sort({ annee_production: -1 });

    return sendSuccess(res, {
      voiture: {
        _id: voiture._id,
        nom_model: voiture.nom_model,
        type_voiture: voiture.type_voiture,
        description: voiture.description,
        prix: voiture.prix,
      },
      models_porsche,
      count: models_porsche.length,
    });
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

export {
  createVoiture,
  getAllVoitures,
  getVoitureById,
  updateVoiture,
  deleteVoiture,
  addImages,
  removeImages,
  getModelsPorscheByVoiture,
};
