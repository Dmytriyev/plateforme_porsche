// Generic success response sender
export const sendSuccess = (res, data, message, statusCode = 200) => {
  const response = { success: true };
  if (message) response.message = message;
  if (data) response.data = data;
  return res.status(statusCode).json(response);
};
// Generic error response sender
export const sendError = (res, message, statusCode = 500, error = null) => {
  const response = { success: false, message };
  if (error && process.env.NODE_ENV === "development") {
    response.error = error.message || error;
  }
  return res.status(statusCode).json(response);
};
// Validation error sender
export const sendValidationError = (res, error) => {
  if (typeof error === "string") {
    return sendError(res, error, 400);
  }
  // Joi validation error handling
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
// Common specific error responses
export const sendNotFound = (res, resource = "Ressource") => {
  return sendError(res, `${resource} introuvable`, 404);
};
// 401 Unauthorized response sender
export const sendUnauthorized = (res, message = "Non autorisé") => {
  return sendError(res, message, 401);
};
// 403 Forbidden response sender
export const sendForbidden = (res, message = "Accès interdit") => {
  return sendError(res, message, 403);
};
