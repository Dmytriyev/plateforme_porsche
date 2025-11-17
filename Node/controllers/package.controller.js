import Package from "../models/package.model.js";
import packageValidation from "../validations/package.validation.js";
import { getAvailablePackages } from "../utils/package.constants.js";
import {
  handleError,
  isEmptyBody,
  getValidationError,
} from "../utils/errorHandler.js";
import { removeUploadedFile } from "../utils/fileConstants.js";

// Créer un nouveau package
const createPackage = async (req, res) => {
  try {
    if (isEmptyBody(req.body)) {
      if (req.file) {
        removeUploadedFile(req.file.filename, "package");
      }
      return res.status(400).json({ message: "Pas de données" });
    }

    // Si un fichier est uploadé, ajouter le chemin complet de la photo
    if (req.file) {
      req.body.photo_package = "/uploads/package/" + req.file.filename;
    }

    const validationError = getValidationError(
      packageValidation(req.body).packageCreate
    );
    // Supprimer le fichier uploadé en cas d'erreur de validation
    if (validationError) {
      if (req.file) {
        removeUploadedFile(req.file.filename, "package");
      }
      return res.status(400).json(validationError);
    }
    // Créer et sauvegarder le package
    const packageItem = await new Package(req.body).save();
    return res.status(201).json(packageItem);
  } catch (error) {
    if (req.file) {
      removeUploadedFile(req.file.filename, "package");
    }
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
    if (isEmptyBody(req.body) && !req.file) {
      return res.status(400).json({ message: "Pas de données" });
    }

    // Si un fichier est uploadé, ajouter le chemin complet de la photo
    if (req.file) {
      req.body.photo_package = "/uploads/package/" + req.file.filename;
    }

    const validationError = getValidationError(
      packageValidation(req.body).packageUpdate
    );
    if (validationError) {
      if (req.file) {
        removeUploadedFile(req.file.filename, "package");
      }
      return res.status(400).json(validationError);
    }

    // Récupérer l'ancien package pour supprimer l'ancienne photo si une nouvelle est uploadée
    if (req.file) {
      const oldPackage = await Package.findById(req.params.id);
      if (oldPackage && oldPackage.photo_package) {
        const oldFilename = oldPackage.photo_package.split("/").pop();
        removeUploadedFile(oldFilename, "package");
      }
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
      if (req.file) {
        removeUploadedFile(req.file.filename, "package");
      }
      return res.status(404).json({ message: "Package introuvable" });
    }
    return res.json(packageItem);
  } catch (error) {
    if (req.file) {
      removeUploadedFile(req.file.filename, "package");
    }
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

    // Supprimer la photo associée si elle existe
    if (packageItem.photo_package) {
      const filename = packageItem.photo_package.split("/").pop();
      removeUploadedFile(filename, "package");
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
