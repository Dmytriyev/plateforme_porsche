/**
 * Gère les erreurs et envoie une réponse au client.
 * Mappe certains types d'erreurs courants (Mongoose, duplication)
 * @param {import('express').Response} res - Objet response Express
 * @param {Error|Object} error - Erreur capturée (un Error ou un objet Mongoose/Joi)
 * @param {string} [context=""] - Contexte texte utilisé pour le logging ('User.create')
 * @returns {import('express').Response} - La réponse envoyée
 */
export const handleError = (res, error, context = "") => {
  // Logging conditionnel en dev pour debug
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}]`, error);
  }

  // erreurs de validation (schema required)
  if (error && error.name === "ValidationError") {
    return res
      .status(400)
      .json({ message: "Données invalides", error: error.message });
  }

  // CastError: id invalide (ObjectId mal formé)
  if (error && error.name === "CastError") {
    return res.status(400).json({ message: "ID invalide" });
  }

  // Erreur de duplication: code 11000 est renvoyé par MongoDB en can non unicité
  if (
    error &&
    (error.code === 11000 || (error.code && +error.code === 11000))
  ) {
    // On pourrait extraire la clé dupliquée depuis error.keyValue pour un message plus précis
    const detail = error.keyValue ? `: ${JSON.stringify(error.keyValue)}` : "";
    return res
      .status(409)
      .json({ message: `Cet élément existe déjà${detail}` });
  }
  //  erreur serveur
  return res.status(500).json({ message: "Erreur serveur" });
};

/**
 * Vérifie si le body de la requête est vide.
 * @param {Object|null|undefined} body - Body de la requête
 * @returns {boolean} - true si vide
 */
export const isEmptyBody = (body) => {
  return !body || Object.keys(body).length === 0;
};

/**
 * Transforme le résultat de Joi.validate(schema, data) en objet d'erreur simple
 * @param {Object} validation - Résultat retourné par Joi ({ value, error })
 * @returns {{message: string}|null} - Objet contenant message
 */
export const getValidationError = (validation) => {
  if (validation && validation.error) {
    return { message: validation.error.details[0].message };
  }
  return null;
};
