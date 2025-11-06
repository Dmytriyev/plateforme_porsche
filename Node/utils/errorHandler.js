/*
  Gestion centralisée des erreurs pour les routes Express.
  - handleError(res, error, context) : envoie une réponse JSON standardisée selon le type d'erreur.
  - isEmptyBody(body) : helper pour détecter un body vide.
  - getValidationError(validation) : extrait un message depuis le résultat Joi.
*/

export const handleError = (res, error, context = "") => {
  console.error(`[${context}]`, error);

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
export const isEmptyBody = (body) => {
  return !body || Object.keys(body).length === 0;
};

export const getValidationError = (validation) => {
  if (validation && validation.error) {
    return { message: validation.error.details[0].message };
  }
  return null;
};
