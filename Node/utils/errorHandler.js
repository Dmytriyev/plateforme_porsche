import logger from "./logger.js";

// Gère les erreurs et envoie une réponse appropriée
export const handleError = (res, error, context = "") => {
  // Log plus verbeux en dev, log minimal en production
  if (process.env.NODE_ENV === "production") {
    logger.error(
      `[${context}]`,
      error && error.message ? error.message : String(error)
    );
  } else {
    logger.error(`[${context}]`, error);
  }
  // ValidationError: données invalides
  if (error && error.name === "ValidationError") {
    return res
      .status(400)
      .json({ message: "Données invalides", error: error.message });
  }

  // CastError: id invalide (ObjectId mal formé)
  if (error && error.name === "CastError") {
    return res.status(400).json({ message: "ID invalide" });
  }

  // Erreur de duplication: code 11000
  if (
    error &&
    (error.code === 11000 || (error.code && +error.code === 11000))
  ) {
    //la clé error.keyValue pour un message plus précis
    const detail = error.keyValue ? `: ${JSON.stringify(error.keyValue)}` : "";
    return res
      .status(409)
      .json({ message: `Cet élément existe déjà${detail}` });
  }
  return res.status(500).json({ message: "Erreur serveur" });
};
// Vérifie si le corps de la requête est vide
export const isEmptyBody = (body) => {
  return !body || Object.keys(body).length === 0;
};
// Récupère l'erreur de validation d'un objet de validation (ex: Joi)
export const getValidationError = (validation) => {
  if (validation && validation.error) {
    return { message: validation.error.details[0].message };
  }
  return null;
};
