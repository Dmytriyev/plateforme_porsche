/**
 * Utilitaire de gestion des erreurs
 */

import { ERROR_MESSAGES } from "./constants.js";
import logger from "./logger";

/**
 * Gérer les erreurs API et retourner un message lisible
 * @param {Error} error - Erreur à traiter
 * @returns {string} Message d'erreur formaté
 */
export const handleApiError = (error) => {
  // Erreur réseau
  if (!error.response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Erreur avec réponse du serveur
  const { status, data } = error.response;

  switch (status) {
    case 400:
      return data?.message || ERROR_MESSAGES.VALIDATION_ERROR;

    case 401:
      return data?.message || ERROR_MESSAGES.UNAUTHORIZED;

    case 403:
      return data?.message || ERROR_MESSAGES.FORBIDDEN;

    case 404:
      return data?.message || ERROR_MESSAGES.NOT_FOUND;

    case 500:
    case 502:
    case 503:
      return ERROR_MESSAGES.SERVER_ERROR;

    default:
      return data?.message || "Une erreur est survenue";
  }
};

/**
 * Logger les erreurs en mode développement
 * @param {string} context - Contexte de l'erreur
 * @param {Error} error - Erreur à logger
 */
export const logError = (context, error) => {
  if (import.meta.env.DEV) {
    logger.error(`[${context}]`, error);
    if (error.response) {
      logger.error("Response data:", error.response.data);
      logger.error("Response status:", error.response.status);
    }
  }
};

/**
 * Extraire le message d'erreur d'une réponse API
 * @param {Object} error - Erreur de la requête
 * @returns {string} Message d'erreur
 */
export const getErrorMessage = (error) => {
  if (typeof error === "string") {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  return "Une erreur est survenue";
};

/**
 * Vérifier si l'erreur est une erreur d'authentification
 * @param {Error} error - Erreur à vérifier
 * @returns {boolean} true si erreur d'authentification
 */
export const isAuthError = (error) => {
  return error?.response?.status === 401;
};

/**
 * Vérifier si l'erreur est une erreur de validation
 * @param {Error} error - Erreur à vérifier
 * @returns {boolean} true si erreur de validation
 */
export const isValidationError = (error) => {
  return error?.response?.status === 400;
};

/**
 * Extraire les erreurs de validation d'un formulaire
 * @param {Error} error - Erreur contenant les erreurs de validation
 * @returns {Object} Objet avec les erreurs par champ
 */
export const getValidationErrors = (error) => {
  const errors = {};

  if (error?.response?.data?.errors) {
    const validationErrors = error.response.data.errors;

    // Si c'est un tableau d'erreurs
    if (Array.isArray(validationErrors)) {
      validationErrors.forEach((err) => {
        if (err.param) {
          errors[err.param] = err.msg;
        }
      });
    }
    // Si c'est un objet d'erreurs
    else if (typeof validationErrors === "object") {
      Object.keys(validationErrors).forEach((key) => {
        errors[key] = validationErrors[key];
      });
    }
  }

  return errors;
};

export default {
  handleApiError,
  logError,
  getErrorMessage,
  isAuthError,
  isValidationError,
  getValidationErrors,
};
