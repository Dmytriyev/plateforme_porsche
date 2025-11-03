import Couleur_interieur from "../models/couleur_interieur.model.js";
import couleur_interieurValidation from "../validations/couleur_interieur.validation.js";
import {
  handleError,
  isEmptyBody,
  getValidationError,
} from "../utils/errorHandler.js";

// Créer une nouvelle couleur intérieure (admin uniquement)
const createCouleur_interieur = async (req, res) => {
  try {
    if (isEmptyBody(req.body)) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const validation = couleur_interieurValidation(
      req.body
    ).couleur_interieurCreate;
    const validationError = getValidationError(validation);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const couleur_interieur = new Couleur_interieur(req.body);
    const newCouleur_interieur = await couleur_interieur.save();

    return res.status(201).json({
      message: "Couleur intérieure créée avec succès",
      couleur: newCouleur_interieur,
    });
  } catch (error) {
    return handleError(res, error, "createCouleur_interieur");
  }
};

// Récupérer toutes les couleurs intérieures avec leurs modèles (public)
const getAllCouleur_interieurs = async (req, res) => {
  try {
    const couleur_interieurs = await Couleur_interieur.find()
      .populate("model_porsche", "nom_model prix")
      .sort({ nom_couleur: 1 });
    return res.status(200).json(couleur_interieurs);
  } catch (error) {
    return handleError(res, error, "getAllCouleur_interieurs");
  }
};

// Récupérer une couleur intérieure par ID (public)
const getCouleur_interieurById = async (req, res) => {
  try {
    const couleur_interieur = await Couleur_interieur.findById(
      req.params.id
    ).populate("model_porsche", "nom_model prix description");

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

// Mettre à jour une couleur intérieure (admin uniquement)
const updateCouleur_interieur = async (req, res) => {
  try {
    if (isEmptyBody(req.body)) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const validation = couleur_interieurValidation(
      req.body
    ).couleur_interieurUpdate;
    const validationError = getValidationError(validation);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const updatedCouleur_interieur = await Couleur_interieur.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedCouleur_interieur) {
      return res
        .status(404)
        .json({ message: "Couleur intérieure n'existe pas" });
    }

    return res.status(200).json({
      message: "Couleur intérieure mise à jour avec succès",
      couleur: updatedCouleur_interieur,
    });
  } catch (error) {
    return handleError(res, error, "updateCouleur_interieur");
  }
};

// Supprimer une couleur intérieure (admin uniquement)
const deleteCouleur_interieur = async (req, res) => {
  try {
    const couleur_interieur = await Couleur_interieur.findByIdAndDelete(
      req.params.id
    );

    if (!couleur_interieur) {
      return res
        .status(404)
        .json({ message: "Couleur intérieure n'existe pas" });
    }

    return res
      .status(200)
      .json({ message: "Couleur intérieure supprimée avec succès" });
  } catch (error) {
    return handleError(res, error, "deleteCouleur_interieur");
  }
};

export {
  createCouleur_interieur,
  getAllCouleur_interieurs,
  getCouleur_interieurById,
  updateCouleur_interieur,
  deleteCouleur_interieur,
};
