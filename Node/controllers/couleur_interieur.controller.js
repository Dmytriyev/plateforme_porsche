/**
 * Contrôleur Couleur Intérieure
 * - Gère les couleurs intérieures : création, validation et listing
 */
import Couleur_interieur from "../models/couleur_interieur.model.js";
import couleur_interieurValidation from "../validations/couleur_interieur.validation.js";
import { getAvailableCouleursInterieur } from "../utils/couleur_interieur.constants.js";
import {
  handleError,
  isEmptyBody,
  getValidationError,
} from "../utils/errorHandler.js";
import { removeUploadedFile } from "../utils/fileConstants.js";

// Controller pour gérer les couleurs intérieures
const createCouleurInterieur = async (req, res) => {
  try {
    // Vérifier si le corps de la requête est vide
    if (isEmptyBody(req.body)) {
      if (req.file) {
        removeUploadedFile(req.file.filename, "couleur_interieur");
      }
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Si un fichier est uploadé, ajouter le chemin complet de la photo
    if (req.file) {
      req.body.photo_couleur =
        "/uploads/couleur_interieur/" + req.file.filename;
    }

    // Valider les données de la requête
    const validation = couleur_interieurValidation(
      req.body
    ).couleur_interieurCreate;
    // Récupérer l'erreur de validation s'il y en a une
    const validationError = getValidationError(validation);
    if (validationError) {
      if (req.file) {
        removeUploadedFile(req.file.filename, "couleur_interieur");
      }
      return res.status(400).json({ message: validationError });
    }

    // Créer une nouvelle couleur intérieure et la sauvegarder dans la base de données
    const couleur_interieur = new Couleur_interieur(req.body);
    const newCouleur_interieur = await couleur_interieur.save();
    return res.status(201).json({
      message: "Couleur intérieure créée avec succès",
      couleur: newCouleur_interieur,
    });
  } catch (error) {
    if (req.file) {
      removeUploadedFile(req.file.filename, "couleur_interieur");
    }
    return handleError(res, error, "createCouleur_interieur");
  }
};

// Récupérer toutes les couleurs intérieures
const getAllCouleurInterieur = async (req, res) => {
  try {
    // Récupérer toutes les couleurs intérieures de la base de données du modèle Porsche associé
    const couleur_interieurs = await Couleur_interieur.find()
      .populate("model_porsche", "nom_model prix")
      .sort({ nom_couleur: 1 });
    return res.status(200).json(couleur_interieurs);
  } catch (error) {
    return handleError(res, error, "getAllCouleur_interieurs");
  }
};

// Récupérer une couleur intérieure par ID
const getCouleurInterieurById = async (req, res) => {
  try {
    const couleur_interieur = await Couleur_interieur.findById(
      req.params.id
    ).populate("model_porsche", "nom_model prix description");
    // Vérifier si la couleur intérieure existe
    if (!couleur_interieur) {
      return res
        .status(404)
        .json({ message: "Couleur intérieure n'existe pas" });
    }

    return res.status(200).json(couleur_interieur);
  } catch (error) {
    return handleError(res, error, "getCouleur_interieurById");
  }
};

// Mettre à jour une couleur intérieure par ID
const updateCouleurInterieur = async (req, res) => {
  try {
    if (isEmptyBody(req.body) && !req.file) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Si un fichier est uploadé, ajouter le chemin complet de la photo
    if (req.file) {
      req.body.photo_couleur =
        "/uploads/couleur_interieur/" + req.file.filename;
    }

    const validation = couleur_interieurValidation(
      req.body
    ).couleur_interieurUpdate;
    const validationError = getValidationError(validation);
    if (validationError) {
      if (req.file) {
        removeUploadedFile(req.file.filename, "couleur_interieur");
      }
      return res.status(400).json({ message: validationError });
    }

    // Récupérer l'ancienne couleur pour supprimer l'ancienne photo si une nouvelle est uploadée
    if (req.file) {
      const oldCouleur = await Couleur_interieur.findById(req.params.id);
      if (oldCouleur && oldCouleur.photo_couleur) {
        const oldFilename = oldCouleur.photo_couleur.split("/").pop();
        removeUploadedFile(oldFilename, "couleur_interieur");
      }
    }

    // Mettre à jour la couleur intérieure dans la base de données
    const updatedCouleur_interieur = await Couleur_interieur.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    // Vérifier si la couleur intérieure existe après mise à jour
    if (!updatedCouleur_interieur) {
      if (req.file) {
        removeUploadedFile(req.file.filename, "couleur_interieur");
      }
      return res
        .status(404)
        .json({ message: "Couleur intérieure n'existe pas" });
    }

    return res.status(200).json({
      message: "Couleur intérieure mise à jour avec succès",
      couleur: updatedCouleur_interieur,
    });
  } catch (error) {
    if (req.file) {
      removeUploadedFile(req.file.filename, "couleur_interieur");
    }
    return handleError(res, error, "updateCouleur_interieur");
  }
};

// Supprimer une couleur intérieure par ID
const deleteCouleurInterieur = async (req, res) => {
  try {
    // Supprimer la couleur intérieure de la base de données
    const couleur_interieur = await Couleur_interieur.findByIdAndDelete(
      req.params.id
    );
    // Vérifier si la couleur intérieure existe avant suppression
    if (!couleur_interieur) {
      return res
        .status(404)
        .json({ message: "Couleur intérieure n'existe pas" });
    }

    // Supprimer la photo associée si elle existe
    if (couleur_interieur.photo_couleur) {
      const filename = couleur_interieur.photo_couleur.split("/").pop();
      removeUploadedFile(filename, "couleur_interieur");
    }

    return res
      .status(200)
      .json({ message: "Couleur intérieure supprimée avec succès" });
  } catch (error) {
    return handleError(res, error, "deleteCouleur_interieur");
  }
};

// Récupérer les options disponibles pour les couleurs intérieures
const getAvailableCouleursInterieurOptions = async (req, res) => {
  try {
    const couleurs = getAvailableCouleursInterieur();
    return res.json({
      success: true,
      data: couleurs,
      message: "Couleurs intérieures récupérées avec succès",
    });
  } catch (error) {
    return handleError(res, error, "getAvailableCouleursInterieurOptions");
  }
};

export {
  createCouleurInterieur,
  getAllCouleurInterieur,
  getCouleurInterieurById,
  updateCouleurInterieur,
  deleteCouleurInterieur,
  getAvailableCouleursInterieurOptions,
};
