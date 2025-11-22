import logger from "./logger.js";
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

export const isEmptyBody = (body) => {
  return !body || Object.keys(body).length === 0;
};

export const getValidationError = (validation) => {
  if (validation?.error?.details?.[0]) {
    return { message: validation.error.details[0].message };
  }
  return null;
};

/**
 * Vérifie si l'utilisateur est propriétaire de la ressource ou admin
 * @param {Object} resource - La ressource avec un champ user
 * @param {Object} reqUser - L'utilisateur de req.user
 * @returns {boolean} true si autorisé, false sinon
 */
export const isOwnerOrAdmin = (resource, reqUser) => {
  if (!resource || !reqUser) return false;
  return resource.user.toString() === reqUser.id || reqUser.isAdmin;
};
