import Siege from "../models/siege.model.js";
import siegeValidation from "../validations/siege.validation.js";
import {
  handleError,
  isEmptyBody,
  getValidationError,
} from "../utils/errorHandler.js";
import { getAvailableSieges } from "../utils/siege.constants.js";
import { removeUploadedFile } from "../utils/fileConstants.js";

// Créer un nouveau type de siège
const createSiege = async (req, res) => {
  try {
    if (isEmptyBody(req.body)) {
      if (req.file) {
        removeUploadedFile(req.file.filename, "siege");
      }
      return res.status(400).json({ message: "Pas de données" });
    }

    // Si un fichier est uploadé, ajouter le chemin complet de la photo
    if (req.file) {
      req.body.photo_siege = "/uploads/siege/" + req.file.filename;
    }

    const validationError = getValidationError(
      siegeValidation(req.body).siegeCreate
    );
    if (validationError) {
      if (req.file) {
        removeUploadedFile(req.file.filename, "siege");
      }
      return res.status(400).json(validationError);
    }
    // Créer et enregistrer le nouveau type de siège dans la base de données
    const siege = await new Siege(req.body).save();
    return res.status(201).json(siege);
  } catch (error) {
    if (req.file) {
      removeUploadedFile(req.file.filename, "siege");
    }
    return handleError(res, error, "createSiege");
  }
};
// Obtenir tous les types de sièges
const getAllSieges = async (req, res) => {
  try {
    const sieges = await Siege.find().sort({ prix: 1 });
    return res.json(sieges);
  } catch (error) {
    return handleError(res, error, "getAllSieges");
  }
};
// Obtenir un type de siège par ID
const getSiegeById = async (req, res) => {
  try {
    const siege = await Siege.findById(req.params.id);
    if (!siege) {
      return res.status(404).json({ message: "Siège introuvable" });
    }
    return res.json(siege);
  } catch (error) {
    return handleError(res, error, "getSiegeById");
  }
};
// Mettre à jour un type de siège par ID
const updateSiege = async (req, res) => {
  try {
    if (isEmptyBody(req.body) && !req.file) {
      return res.status(400).json({ message: "Pas de données" });
    }

    // Si un fichier est uploadé, ajouter le chemin complet de la photo
    if (req.file) {
      req.body.photo_siege = "/uploads/siege/" + req.file.filename;
    }

    const validationError = getValidationError(
      siegeValidation(req.body).siegeUpdate
    );
    if (validationError) {
      if (req.file) {
        removeUploadedFile(req.file.filename, "siege");
      }
      return res.status(400).json(validationError);
    }

    // Récupérer l'ancien siège pour supprimer l'ancienne photo si une nouvelle est uploadée
    if (req.file) {
      const oldSiege = await Siege.findById(req.params.id);
      // Supprimer l'ancienne photo si elle existe
      if (oldSiege && oldSiege.photo_siege) {
        const oldFilename = oldSiege.photo_siege.split("/").pop();
        removeUploadedFile(oldFilename, "siege");
      }
    }

    // Mettre à jour le type de siège dans la base de données
    const siege = await Siege.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!siege) {
      if (req.file) {
        removeUploadedFile(req.file.filename, "siege");
      }
      return res.status(404).json({ message: "Siège introuvable" });
    }
    return res.json(siege);
  } catch (error) {
    if (req.file) {
      removeUploadedFile(req.file.filename, "siege");
    }
    return handleError(res, error, "updateSiege");
  }
};
// Supprimer un type de siège par ID
const deleteSiege = async (req, res) => {
  try {
    const siege = await Siege.findByIdAndDelete(req.params.id);
    if (!siege) {
      return res.status(404).json({ message: "Siège introuvable" });
    }

    // Supprimer la photo associée si elle existe
    if (siege.photo_siege) {
      const filename = siege.photo_siege.split("/").pop();
      removeUploadedFile(filename, "siege");
    }

    return res.json({ message: "Siège supprimé avec succès" });
  } catch (error) {
    return handleError(res, error, "deleteSiege");
  }
};

// Obtenir les types de sièges disponibles
const getAvailableSiegeTypes = async (req, res) => {
  try {
    const types = getAvailableSieges();
    return res.json(types);
  } catch (error) {
    return handleError(res, error, "getAvailableSiegeTypes");
  }
};

export {
  createSiege,
  getAllSieges,
  getSiegeById,
  updateSiege,
  deleteSiege,
  getAvailableSiegeTypes,
};
