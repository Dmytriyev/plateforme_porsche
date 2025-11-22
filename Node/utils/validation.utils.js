import mongoose from "mongoose";

/**
 * Validation personnalisée pour Joi - Vérifie si une chaîne est un ObjectId MongoDB valide
 * @param {string} value - La valeur à valider
 * @param {object} helpers - Les helpers Joi pour gérer les erreurs
 * @returns {string} - La valeur si valide
 * @throws {Error} - Si l'ID n'est pas un ObjectId valide
 */
export const validateObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};
