// Controller: Couleur extérieure
// Gère les couleurs extérieures (CRUD) et fournit des listes pour les formulaires.
import Couleur_exterieur from "../models/couleur_exterieur.model.js";
import couleur_exterieurValidation from "../validations/couleur_exterieur.validation.js";
import { getAvailableCouleursExterieur } from "../utils/couleur_exterieur.constants.js";
import {
  handleError,
  isEmptyBody,
  getValidationError,
} from "../utils/errorHandler.js";

import mongoose from "mongoose";

const createCouleurExterieur = async (req, res) => {
  try {
    if (isEmptyBody(req.body)) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const validation = couleur_exterieurValidation(
      req.body
    ).couleur_exterieurCreate;
    const validationError = getValidationError(validation);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const couleur_exterieur = new Couleur_exterieur(req.body);
    const newCouleur_exterieur = await couleur_exterieur.save();

    return res.status(201).json({
      message: "Couleur extérieure créée avec succès",
      couleur: newCouleur_exterieur,
    });
  } catch (error) {
    return handleError(res, error, "createCouleur_exterieur");
  }
};

const getAllCouleurExterieur = async (req, res) => {
  try {
    const couleur_exterieurs = await Couleur_exterieur.find()
      .sort({ nom_couleur: 1 })
      .lean(); // Retourne des objets JS purs (30-50% plus rapide)
    return res.status(200).json(couleur_exterieurs);
  } catch (error) {
    return handleError(res, error, "getAllCouleur_exterieurs");
  }
};

const getCouleurExterieurById = async (req, res) => {
  try {
    const couleur_exterieur = await Couleur_exterieur.findById(
      req.params.id
    ).lean();
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

const updateCouleurExterieur = async (req, res) => {
  try {
    if (isEmptyBody(req.body)) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const validation = couleur_exterieurValidation(
      req.body
    ).couleur_exterieurUpdate;
    const validationError = getValidationError(validation);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const updatedCouleur_exterieur = await Couleur_exterieur.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedCouleur_exterieur) {
      return res
        .status(404)
        .json({ message: "Couleur extérieure n'existe pas" });
    }

    return res.status(200).json({
      message: "Couleur extérieure mise à jour avec succès",
      couleur: updatedCouleur_exterieur,
    });
  } catch (error) {
    return handleError(res, error, "updateCouleur_exterieur");
  }
};

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

    return res
      .status(200)
      .json({ message: "Couleur extérieure supprimée avec succès" });
  } catch (error) {
    return handleError(res, error, "deleteCouleur_exterieur");
  }
};

/**
 * Récupère la liste des couleurs extérieures disponibles
 * @route GET /api/couleur_exterieur/couleurs
 * @access Public
 */
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
