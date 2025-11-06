/*
  Description: functions pour les réponses HTTP JSON de l'API.
  Fonctions:
  - sendSuccess(res, data, message, statusCode)
  - sendError(res, message, statusCode, error)
  - sendValidationError(res, error)
  - sendNotFound(res, resource)
  - sendUnauthorized(res, message)
  - sendForbidden(res, message)
*/
export const sendSuccess = (res, data, message, statusCode = 200) => {
  const response = { success: true };
  if (message) response.message = message;
  if (data) response.data = data;
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
  if (typeof error === "string") {
    return sendError(res, error, 400);
  }
  if (
    error &&
    error.details &&
    Array.isArray(error.details) &&
    error.details[0]
  ) {
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
