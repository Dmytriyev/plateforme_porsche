export const sendSuccess = (res, data, message, statusCode = 200) => {
  const response = { success: true };
  if (message) response.message = message;
  if (data !== undefined) response.data = data;
  return res.status(statusCode).json(response);
};

export const sendError = (res, message, statusCode = 500, error = null) => {
  const response = { success: false, message };
  if (error && process.env.NODE_ENV === "development") {
    response.error = error.message || error;
  }
  return res.status(statusCode).json(response);
};

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

export const sendNotFound = (res, resource = "Ressource") => {
  return sendError(res, `${resource} introuvable`, 404);
};

export const sendUnauthorized = (res, message = "Non autorisé") => {
  return sendError(res, message, 401);
};

export const sendForbidden = (res, message = "Accès interdit") => {
  return sendError(res, message, 403);
};

/**
 * Vérifie si le corps de la requête est vide et retourne une erreur si c'est le cas
 * @param {Object} res - Objet response Express
 * @param {Object} body - Corps de la requête
 * @returns {boolean} true si vide (et erreur envoyée), false sinon
 */
export const validateBodyNotEmpty = (res, body) => {
  if (!body || Object.keys(body).length === 0) {
    sendValidationError(res, "Pas de données dans la requête");
    return true; // Indique qu'une erreur a été envoyée
  }
  return false; // Corps valide
};
