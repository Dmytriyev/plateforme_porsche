import Siege from "../models/siege.model.js";
import siegeValidation from "../validations/siege.validation.js";
import {
  handleError,
  isEmptyBody,
  getValidationError,
} from "../utils/errorHandler.js";

const createSiege = async (req, res) => {
  try {
    if (isEmptyBody(req.body)) {
      return res.status(400).json({ message: "Pas de données" });
    }

    const validationError = getValidationError(
      siegeValidation(req.body).siegeCreate
    );
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const siege = await new Siege(req.body).save();
    return res.status(201).json(siege);
  } catch (error) {
    return handleError(res, error, "createSiege");
  }
};

const getAllSieges = async (req, res) => {
  try {
    const sieges = await Siege.find().sort({ prix: 1 });
    return res.json(sieges);
  } catch (error) {
    return handleError(res, error, "getAllSieges");
  }
};

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

const updateSiege = async (req, res) => {
  try {
    if (isEmptyBody(req.body)) {
      return res.status(400).json({ message: "Pas de données" });
    }

    const validationError = getValidationError(
      siegeValidation(req.body).siegeUpdate
    );
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const siege = await Siege.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!siege) {
      return res.status(404).json({ message: "Siège introuvable" });
    }

    return res.json(siege);
  } catch (error) {
    return handleError(res, error, "updateSiege");
  }
};

const deleteSiege = async (req, res) => {
  try {
    const siege = await Siege.findByIdAndDelete(req.params.id);
    if (!siege) {
      return res.status(404).json({ message: "Siège introuvable" });
    }
    return res.json({ message: "Siège supprimé avec succès" });
  } catch (error) {
    return handleError(res, error, "deleteSiege");
  }
};

export { createSiege, getAllSieges, getSiegeById, updateSiege, deleteSiege };
