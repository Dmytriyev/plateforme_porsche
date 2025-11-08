// CRUD pour les tailles et options de jantes
import Taille_jante from "../models/taille_jante.model.js";
import taille_janteValidation from "../validations/taille_jante.validation.js";
import {
  handleError,
  isEmptyBody,
  getValidationError,
} from "../utils/errorHandler.js";
import { getJanteOptions } from "../utils/jante.constants.js";
//  Créer une nouvelle taille de jante
const createTaille_jante = async (req, res) => {
  try {
    if (isEmptyBody(req.body)) {
      return res.status(400).json({ message: "Pas de données" });
    }
    const validationError = getValidationError(
      taille_janteValidation(req.body).taille_janteCreate
    );
    if (validationError) {
      return res.status(400).json(validationError);
    }
    // Créer et enregistrer la nouvelle taille de jante dans la base de données
    const taille_jante = await new Taille_jante(req.body).save();
    return res.status(201).json(taille_jante);
  } catch (error) {
    return handleError(res, error, "createTaille_jante");
  }
};
// Obtenir toutes les tailles de jantes
const getAllTaille_jantes = async (req, res) => {
  try {
    const taille_jantes = await Taille_jante.find();
    return res.json(taille_jantes);
  } catch (error) {
    return handleError(res, error, "getAllTaille_jantes");
  }
};
// Obtenir une taille de jante par ID
const getTaille_janteById = async (req, res) => {
  try {
    const taille_jante = await Taille_jante.findById(req.params.id);
    if (!taille_jante) {
      return res.status(404).json({ message: "Introuvable" });
    }
    return res.json(taille_jante);
  } catch (error) {
    return handleError(res, error, "getTaille_janteById");
  }
};
// Mettre à jour une taille de jante par ID
const updateTaille_jante = async (req, res) => {
  try {
    if (isEmptyBody(req.body)) {
      return res.status(400).json({ message: "Pas de données" });
    }
    const validationError = getValidationError(
      taille_janteValidation(req.body).taille_janteUpdate
    );
    if (validationError) {
      return res.status(400).json(validationError);
    }
    // Mettre à jour la taille de jante dans la base de données
    const taille_jante = await Taille_jante.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!taille_jante) {
      return res.status(404).json({ message: "Introuvable" });
    }
    return res.json(taille_jante);
  } catch (error) {
    return handleError(res, error, "updateTaille_jante");
  }
};
// Supprimer une taille de jante par ID
const deleteTaille_jante = async (req, res) => {
  try {
    const taille_jante = await Taille_jante.findByIdAndDelete(req.params.id);
    if (!taille_jante) {
      return res.status(404).json({ message: "Introuvable" });
    }
    return res.json({ message: "Supprimé avec succès" });
  } catch (error) {
    return handleError(res, error, "deleteTaille_jante");
  }
};
// Obtenir les options de jantes disponibles
const getAvailableJanteOptions = async (req, res) => {
  try {
    const options = getJanteOptions();
    return res.json(options);
  } catch (error) {
    return handleError(res, error, "getAvailableJanteOptions");
  }
};

export {
  createTaille_jante,
  getAllTaille_jantes,
  getTaille_janteById,
  updateTaille_jante,
  deleteTaille_jante,
  getAvailableJanteOptions,
};
