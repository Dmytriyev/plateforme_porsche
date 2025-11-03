// Gestionnaire d'erreurs centralisé

/**
 * Gère les erreurs et envoie une réponse appropriée
 * @param {Object} res - Objet response Express
 * @param {Error} error - Erreur à gérer
 * @param {String} context - Contexte de l'erreur (nom de la fonction)
 */
export const handleError = (res, error, context = "") => {
  // Log uniquement en développement
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}]`, error);
  }

  // Erreur de validation Mongoose
  if (error.name === "ValidationError") {
    return res
      .status(400)
      .json({ message: "Données invalides", error: error.message });
  }

  // Erreur de cast (ID invalide)
  if (error.name === "CastError") {
    return res.status(400).json({ message: "ID invalide" });
  }

  // Erreur de duplication (unique constraint)
  if (error.code === 11000) {
    return res.status(409).json({ message: "Cet élément existe déjà" });
  }

  // Erreur générique
  return res.status(500).json({ message: "Erreur serveur" });
};

/**
 * Vérifie si le body de la requête est vide
 * @param {Object} body - Body de la requête
 * @returns {Boolean} - true si vide
 */
export const isEmptyBody = (body) => {
  return !body || Object.keys(body).length === 0;
};

/**
 * Valide les données avec Joi et retourne l'erreur formatée
 * @param {Object} validation - Résultat de la validation Joi
 * @returns {Object|null} - Objet d'erreur ou null
 */
export const getValidationError = (validation) => {
  if (validation.error) {
    return { message: validation.error.details[0].message };
  }
  return null;
};
