// CRUD pour les packages/options vendus en complément des véhicules
import Package from "../models/package.model.js";
import packageValidation from "../validations/package.validation.js";
import { getAvailablePackages } from "../utils/package.constants.js";
import {
  handleError,
  isEmptyBody,
  getValidationError,
} from "../utils/errorHandler.js";

// Créer un nouveau package
const createPackage = async (req, res) => {
  try {
    if (isEmptyBody(req.body)) {
      return res.status(400).json({ message: "Pas de données" });
    }

    const validationError = getValidationError(
      packageValidation(req.body).packageCreate
    );
    if (validationError) {
      return res.status(400).json(validationError);
    }
    // Créer et sauvegarder le package
    const packageItem = await new Package(req.body).save();
    return res.status(201).json(packageItem);
  } catch (error) {
    return handleError(res, error, "createPackage");
  }
};

// Récupérer tous les packages disponibles, triés par prix croissant
const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find({ disponible: true }).sort({ prix: 1 });
    return res.json(packages);
  } catch (error) {
    return handleError(res, error, "getAllPackages");
  }
};

// Récupérer un package par son ID
const getPackageById = async (req, res) => {
  try {
    const packageItem = await Package.findById(req.params.id);
    if (!packageItem) {
      return res.status(404).json({ message: "Package introuvable" });
    }
    return res.json(packageItem);
  } catch (error) {
    return handleError(res, error, "getPackageById");
  }
};

// Mettre à jour un package existant
const updatePackage = async (req, res) => {
  try {
    if (isEmptyBody(req.body)) {
      return res.status(400).json({ message: "Pas de données" });
    }

    const validationError = getValidationError(
      packageValidation(req.body).packageUpdate
    );
    if (validationError) {
      return res.status(400).json(validationError);
    }

    // Mettre à jour le package dans la base de données et retourner le package mis à jour
    const packageItem = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!packageItem) {
      return res.status(404).json({ message: "Package introuvable" });
    }
    return res.json(packageItem);
  } catch (error) {
    return handleError(res, error, "updatePackage");
  }
};

// Supprimer un package par son ID
const deletePackage = async (req, res) => {
  try {
    const packageItem = await Package.findByIdAndDelete(req.params.id);
    if (!packageItem) {
      return res.status(404).json({ message: "Package introuvable" });
    }
    return res.json({ message: "Package supprimé avec succès" });
  } catch (error) {
    return handleError(res, error, "deletePackage");
  }
};

// Récupérer les types de packages disponibles
const getAvailablePackageTypes = async (req, res) => {
  try {
    const types = getAvailablePackages();
    return res.json({
      success: true,
      data: types,
      message: "Types de packages récupérés avec succès",
    });
  } catch (error) {
    return handleError(res, error, "getAvailablePackageTypes");
  }
};

export {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  getAvailablePackageTypes,
};
