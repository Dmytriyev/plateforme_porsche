/**
 * Helpers pour les réponses HTTP standardisées
 * Simplifie l'envoi de réponses JSON cohérentes dans toute l'API
 */

/**
 * Envoie une réponse de succès
 * @param {Object} res - Objet Response Express
 * @param {*} data - Données à envoyer
 * @param {string} message - Message optionnel
 * @param {number} statusCode - Code HTTP (défaut: 200)
 */
export const sendSuccess = (res, data, message, statusCode = 200) => {
  const response = { success: true };
  if (message) response.message = message;
  if (data !== undefined) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Envoie une réponse d'erreur
 * @param {Object} res - Objet Response Express
 * @param {string} message - Message d'erreur
 * @param {number} statusCode - Code HTTP (défaut: 500)
 * @param {Error} error - Erreur originale (envoyée en dev uniquement)
 */
export const sendError = (res, message, statusCode = 500, error = null) => {
  const response = { success: false, message };
  if (error && process.env.NODE_ENV === "development") {
    response.error = error.message || error;
  }
  return res.status(statusCode).json(response);
};

/**
 * Envoie une erreur de validation (400 Bad Request)
 * @param {Object} res - Objet Response Express
 * @param {string|Object} error - Message ou objet d'erreur Joi
 */
export const sendValidationError = (res, error) => {
  // Erreur simple (string)
  if (typeof error === "string") {
    return sendError(res, error, 400);
  }
  // Erreur Joi
  if (error?.details?.[0]?.message) {
    return sendError(res, error.details[0].message, 400);
  }
  return sendError(res, "Données invalides", 400);
};

/**
 * Envoie une erreur 404 Not Found
 * @param {Object} res - Objet Response Express
 * @param {string} resource - Nom de la ressource non trouvée
 */
export const sendNotFound = (res, resource = "Ressource") => {
  return sendError(res, `${resource} introuvable`, 404);
};

/**
 * Envoie une erreur 401 Unauthorized
 */
export const sendUnauthorized = (res, message = "Non autorisé") => {
  return sendError(res, message, 401);
};

/**
 * Envoie une erreur 403 Forbidden
 */
export const sendForbidden = (res, message = "Accès interdit") => {
  return sendError(res, message, 403);
};
