import Couleur_accesoire from "../models/couleur_accesoire.model.js";
import couleur_accesoireValidation from "../validations/couleur_accesoire.validation.js";
import {
  handleError,
  isEmptyBody,
  getValidationError,
} from "../utils/errorHandler.js";

// Créer une nouvelle couleur d'accesoire
const createCouleur_accesoire = async (req, res) => {
  try {
    if (isEmptyBody(req.body)) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const validation = couleur_accesoireValidation(
      req.body
    ).couleur_accesoireCreate;
    // Vérification des erreurs de validation des données
    const validationError = getValidationError(validation);
    if (validationError) {
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
    return handleError(res, error, "createCouleur_accesoire");
  }
};

// Récupérer toutes les couleurs d'accesoires
const getAllCouleur_accesoires = async (req, res) => {
  try {
    const couleur_accesoires = await Couleur_accesoire.find().sort({
      nom_couleur: 1,
    });
    return res.status(200).json(couleur_accesoires);
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
    if (isEmptyBody(req.body)) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const validation = couleur_accesoireValidation(
      req.body
    ).couleur_accesoireUpdate;
    const validationError = getValidationError(validation);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }
    // Mise à jour de la couleur d'accesoire dans la base de données
    const updatedCouleur_accesoire = await Couleur_accesoire.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    // Vérification si la couleur d'accesoire existe après mise à jour
    if (!updatedCouleur_accesoire) {
      return res
        .status(404)
        .json({ message: "Couleur d'accesoire n'existe pas" });
    }

    return res.status(200).json({
      message: "Couleur d'accesoire mise à jour avec succès",
      couleur: updatedCouleur_accesoire,
    });
  } catch (error) {
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
