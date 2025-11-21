/**
 * Utilitaires de gestion d'erreurs
 * Fournit des helpers pour gérer les erreurs courantes (MongoDB, validation, etc.)
 */
import logger from "./logger.js";

/**
 * Gère les erreurs et envoie une réponse HTTP appropriée
 * @param {Object} res - Objet Response Express
 * @param {Error} error - L'erreur à traiter
 * @param {string} context - Contexte de l'erreur pour les logs
 */
export const handleError = (res, error, context = "") => {
  // Logger l'erreur
  const logMessage = context ? `[${context}]` : "";
  const errorDetail =
    process.env.NODE_ENV === "production"
      ? error.message || String(error)
      : error;
  logger.error(logMessage, errorDetail);

  // Erreur de validation MongoDB
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Données invalides",
      error: error.message,
    });
  }

  // Erreur d'ID invalide (MongoDB CastError)
  if (error.name === "CastError") {
    return res.status(400).json({ message: "ID invalide" });
  }

  // Erreur de duplication MongoDB (code 11000)
  if (error.code === 11000) {
    const detail = error.keyValue ? `: ${JSON.stringify(error.keyValue)}` : "";
    return res.status(409).json({
      message: `Cet élément existe déjà${detail}`,
    });
  }

  // Erreur serveur générique
  return res.status(500).json({ message: "Erreur serveur" });
};

/**
 * Vérifie si le corps de la requête est vide
 * @param {Object} body - Corps de la requête
 * @returns {boolean}
 */
export const isEmptyBody = (body) => {
  return !body || Object.keys(body).length === 0;
};

/**
 * Extrait le message d'erreur d'une validation Joi
 * @param {Object} validation - Résultat de validation Joi
 * @returns {Object|null}
 */
export const getValidationError = (validation) => {
  if (validation?.error?.details?.[0]) {
    return { message: validation.error.details[0].message };
  }
  return null;
};
