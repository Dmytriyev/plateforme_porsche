/**
 * Contrôleur Couleur Accesoire
 * - Gère les couleurs applicables aux accessoires : CRUD et gestion des fichiers
 */
import Couleur_accesoire from "../models/couleur_accesoire.model.js";
import couleur_accesoireValidation from "../validations/couleur_accesoire.validation.js";
import {
  handleError,
  isEmptyBody,
  getValidationError,
} from "../utils/errorHandler.js";
import { removeUploadedFile } from "../utils/fileConstants.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils/responses.js";

// Créer une nouvelle couleur d'accesoire
const createCouleur_accesoire = async (req, res) => {
  try {
    if (isEmptyBody(req.body)) {
      if (req.file) {
        removeUploadedFile(req.file.filename, "couleur_accesoire");
      }
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Si un fichier est uploadé, ajouter le chemin complet de la photo
    if (req.file) {
      req.body.photo_couleur =
        "/uploads/couleur_accesoire/" + req.file.filename;
    }

    const validation = couleur_accesoireValidation(
      req.body
    ).couleur_accesoireCreate;
    // Vérification des erreurs de validation des données
    const validationError = getValidationError(validation);
    if (validationError) {
      // Supprimer le fichier uploadé en cas d'erreur de validation
      if (req.file) {
        removeUploadedFile(req.file.filename, "couleur_accesoire");
      }
      return res.status(400).json({ message: validationError });
    }

    // Création et sauvegarde de la nouvelle couleur d'accesoire
    const couleur_accesoire = new Couleur_accesoire(req.body);
    const newCouleur_accesoire = await couleur_accesoire.save();

    return res.status(201).json({
      message: "Couleur d'accesoire créée avec succès",
      couleur: newCouleur_accesoire,
    });
  } catch (error) {
    if (req.file) {
      removeUploadedFile(req.file.filename, "couleur_accesoire");
    }
    return handleError(res, error, "createCouleur_accesoire");
  }
};

// Récupérer toutes les couleurs d'accesoires
const getAllCouleur_accesoires = async (req, res) => {
  try {
    const couleur_accesoires = await Couleur_accesoire.find()
      .sort({ nom_couleur: 1 })
      .lean();
    return sendSuccess(
      res,
      couleur_accesoires,
      "Couleurs d'accessoires récupérées avec succès"
    );
  } catch (error) {
    return handleError(res, error, "getAllCouleur_accesoires");
  }
};

// Récupérer une couleur d'accesoire par ID
const getCouleur_accesoireById = async (req, res) => {
  try {
    const couleur_accesoire = await Couleur_accesoire.findById(req.params.id);

    if (!couleur_accesoire) {
      return res
        .status(404)
        .json({ message: "Couleur d'accesoire n'existe pas" });
    }

    return res.status(200).json(couleur_accesoire);
  } catch (error) {
    return handleError(res, error, "getCouleur_accesoireById");
  }
};

// Mettre à jour une couleur d'accesoire
const updateCouleur_accesoire = async (req, res) => {
  try {
    if (isEmptyBody(req.body) && !req.file) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Si un fichier est uploadé, ajouter le chemin complet de la photo
    if (req.file) {
      req.body.photo_couleur =
        "/uploads/couleur_accesoire/" + req.file.filename;
    }

    const validation = couleur_accesoireValidation(
      req.body
    ).couleur_accesoireUpdate;
    const validationError = getValidationError(validation);
    if (validationError) {
      if (req.file) {
        removeUploadedFile(req.file.filename, "couleur_accesoire");
      }
      return res.status(400).json({ message: validationError });
    }

    // Récupérer l'ancienne couleur pour supprimer l'ancienne photo si une nouvelle est uploadée
    if (req.file) {
      const oldCouleur = await Couleur_accesoire.findById(req.params.id);
      if (oldCouleur && oldCouleur.photo_couleur) {
        const oldFilename = oldCouleur.photo_couleur.split("/").pop();
        removeUploadedFile(oldFilename, "couleur_accesoire");
      }
    }

    // Mise à jour de la couleur d'accesoire dans la base de données
    const updatedCouleur_accesoire = await Couleur_accesoire.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    // Vérification si la couleur d'accesoire existe après mise à jour
    if (!updatedCouleur_accesoire) {
      if (req.file) {
        removeUploadedFile(req.file.filename, "couleur_accesoire");
      }
      return res
        .status(404)
        .json({ message: "Couleur d'accesoire n'existe pas" });
    }

    return res.status(200).json({
      message: "Couleur d'accesoire mise à jour avec succès",
      couleur: updatedCouleur_accesoire,
    });
  } catch (error) {
    if (req.file) {
      removeUploadedFile(req.file.filename, "couleur_accesoire");
    }
    return handleError(res, error, "updateCouleur_accesoire");
  }
};

// Supprimer une couleur d'accesoire
const deleteCouleur_accesoire = async (req, res) => {
  try {
    const couleur_accesoire = await Couleur_accesoire.findByIdAndDelete(
      req.params.id
    );

    if (!couleur_accesoire) {
      return res
        .status(404)
        .json({ message: "Couleur d'accesoire n'existe pas" });
    }

    // Supprimer la photo associée si elle existe
    if (couleur_accesoire.photo_couleur) {
      const filename = couleur_accesoire.photo_couleur.split("/").pop();
      removeUploadedFile(filename, "couleur_accesoire");
    }

    return res
      .status(200)
      .json({ message: "Couleur d'accesoire supprimée avec succès" });
  } catch (error) {
    return handleError(res, error, "deleteCouleur_accesoire");
  }
};

export {
  createCouleur_accesoire,
  getAllCouleur_accesoires,
  getCouleur_accesoireById,
  updateCouleur_accesoire,
  deleteCouleur_accesoire,
};
