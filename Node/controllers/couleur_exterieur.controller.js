import Couleur_exterieur from "../models/couleur_exterieur.model.js";
import couleur_exterieurValidation from "../validations/couleur_exterieur.validation.js";
import { getAvailableCouleursExterieur } from "../utils/couleur_exterieur.constants.js";
import {
  handleError,
  isEmptyBody,
  getValidationError,
} from "../utils/errorHandler.js";
import {
  sendError,
  sendSuccess,
  sendValidationError,
} from "../utils/responses.js";
import { removeUploadedFile } from "../utils/fileConstants.js";

// Créer une nouvelle couleur extérieure
const createCouleurExterieur = async (req, res) => {
  try {
    if (isEmptyBody(req.body)) {
      if (req.file) {
        // Supprimer le fichier uploadé en cas d'erreur de validation
        removeUploadedFile(req.file.filename, "couleur_exterieur");
      }
      return sendError(res, "Pas de données dans la requête", 400);
    }

    // Si un fichier est uploadé, ajouter le chemin complet de la photo
    if (req.file) {
      req.body.photo_couleur =
        "/uploads/couleur_exterieur/" + req.file.filename;
    }

    // Valider les données de la requête
    const validation = couleur_exterieurValidation(
      req.body
    ).couleur_exterieurCreate;
    // Récupérer l'erreur de validation s'il y en a une
    const validationError = getValidationError(validation);
    if (validationError) {
      if (req.file) {
        // Supprimer le fichier uploadé en cas d'erreur de validation
        removeUploadedFile(req.file.filename, "couleur_exterieur");
      }
      return sendValidationError(res, validationError.message);
    }

    // Créer et sauvegarder la nouvelle couleur extérieure
    const couleur_exterieur = new Couleur_exterieur(req.body);
    const newCouleur_exterieur = await couleur_exterieur.save();

    return sendSuccess(
      res,
      newCouleur_exterieur,
      "Couleur extérieure créée avec succès",
      201
    );
  } catch (error) {
    if (req.file) {
      removeUploadedFile(req.file.filename, "couleur_exterieur");
    }
    return handleError(res, error, "createCouleur_exterieur");
  }
};

// Récupérer toutes les couleurs extérieures
const getAllCouleurExterieur = async (req, res) => {
  try {
    const couleur_exterieurs = await Couleur_exterieur.find()
      .sort({ nom_couleur: 1 })
      .lean(); // Retourne des objets JS purs au lieu des documents Mongoose
    return res.status(200).json(couleur_exterieurs);
  } catch (error) {
    return handleError(res, error, "getAllCouleur_exterieurs");
  }
};

// Récupérer une couleur extérieure par ID
const getCouleurExterieurById = async (req, res) => {
  try {
    const couleur_exterieur = await Couleur_exterieur.findById(
      req.params.id
    ).lean();
    // Vérifier si la couleur extérieure existe
    if (!couleur_exterieur) {
      return res
        .status(404)
        .json({ message: "Couleur extérieure n'existe pas" });
    }
    return res.status(200).json(couleur_exterieur);
  } catch (error) {
    return handleError(res, error, "getCouleur_exterieurById");
  }
};

// Mettre à jour une couleur extérieure par ID
const updateCouleurExterieur = async (req, res) => {
  try {
    // Vérifier si le corps de la requête est vide
    if (isEmptyBody(req.body) && !req.file) {
      return sendError(res, "Pas de données dans la requête", 400);
    }

    // Si un fichier est uploadé, ajouter le chemin complet de la photo
    if (req.file) {
      req.body.photo_couleur =
        "/uploads/couleur_exterieur/" + req.file.filename;
    }

    // Valider les données de la requête pour la mise à jour
    const validation = couleur_exterieurValidation(
      req.body
    ).couleur_exterieurUpdate;
    const validationError = getValidationError(validation);
    if (validationError) {
      if (req.file) {
        removeUploadedFile(req.file.filename, "couleur_exterieur");
      }
      return sendValidationError(res, validationError.message);
    }

    // Récupérer l'ancienne couleur pour supprimer l'ancienne photo si une nouvelle est uploadée
    if (req.file) {
      const oldCouleur = await Couleur_exterieur.findById(req.params.id);
      if (oldCouleur && oldCouleur.photo_couleur) {
        const oldFilename = oldCouleur.photo_couleur.split("/").pop();
        removeUploadedFile(oldFilename, "couleur_exterieur");
      }
    }

    // Mettre à jour la couleur extérieure dans la base de données
    const updatedCouleur_exterieur = await Couleur_exterieur.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    // Vérifier si la couleur extérieure existe après mise à jour
    if (!updatedCouleur_exterieur) {
      if (req.file) {
        removeUploadedFile(req.file.filename, "couleur_exterieur");
      }
      return res
        .status(404)
        .json({ message: "Couleur extérieure n'existe pas" });
    }

    return res.status(200).json({
      message: "Couleur extérieure mise à jour avec succès",
      couleur: updatedCouleur_exterieur,
    });
  } catch (error) {
    if (req.file) {
      removeUploadedFile(req.file.filename, "couleur_exterieur");
    }
    return handleError(res, error, "updateCouleur_exterieur");
  }
};

// Supprimer une couleur extérieure par ID
const deleteCouleurExterieur = async (req, res) => {
  try {
    const couleur_exterieur = await Couleur_exterieur.findByIdAndDelete(
      req.params.id
    );

    if (!couleur_exterieur) {
      return res
        .status(404)
        .json({ message: "Couleur extérieure n'existe pas" });
    }

    // Supprimer la photo associée si elle existe
    if (couleur_exterieur.photo_couleur) {
      const filename = couleur_exterieur.photo_couleur.split("/").pop();
      removeUploadedFile(filename, "couleur_exterieur");
    }

    return res
      .status(200)
      .json({ message: "Couleur extérieure supprimée avec succès" });
  } catch (error) {
    return handleError(res, error, "deleteCouleur_exterieur");
  }
};

// Récupérer les options de couleurs extérieures disponibles
const getAvailableCouleursExterieurOptions = async (req, res) => {
  try {
    const couleurs = getAvailableCouleursExterieur();
    return res.json({
      success: true,
      data: couleurs,
      message: "Couleurs extérieures récupérées avec succès",
    });
  } catch (error) {
    return handleError(res, error, "getAvailableCouleursExterieurOptions");
  }
};

export {
  createCouleurExterieur,
  getAllCouleurExterieur,
  getCouleurExterieurById,
  updateCouleurExterieur,
  deleteCouleurExterieur,
  getAvailableCouleursExterieurOptions,
};
