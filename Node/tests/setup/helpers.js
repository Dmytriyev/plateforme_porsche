/**
 * Helpers - Fonctions utilitaires pour les tests
 * Principe: DRY et réutilisabilité
 */

/**
 * Extrait les données d'une réponse API de manière robuste
 * Gère les différents formats de réponse de l'API
 *
 * @param {Object} response - Réponse de l'API
 * @param {...string} keys - Clés possibles où chercher les données
 * @returns {*} Les données extraites
 */
export const extractData = (response, ...keys) => {
  if (!response || !response.data) {
    return null;
  }

  // Chercher dans les clés spécifiées
  for (const key of keys) {
    if (response.data[key]) {
      return response.data[key];
    }
  }

  // Si pas trouvé, retourner data directement
  return response.data;
};

/**
 * Attend un délai en millisecondes
 *
 * @param {number} ms - Délai en millisecondes
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry une fonction avec backoff exponentiel
 *
 * @param {Function} fn - Fonction à exécuter
 * @param {number} maxAttempts - Nombre maximum de tentatives
 * @param {number} delay - Délai initial entre les tentatives
 * @returns {Promise<*>}
 */
export const retryWithBackoff = async (fn, maxAttempts = 3, delay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        const backoffDelay = delay * Math.pow(2, attempt - 1);
        await sleep(backoffDelay);
      }
    }
  }

  throw lastError;
};

/**
 * Valide le format d'un ID MongoDB
 *
 * @param {string} id - ID à valider
 * @returns {boolean}
 */
export const isValidMongoId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Valide le format d'un email
 *
 * @param {string} email - Email à valider
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Valide le format d'un numéro de téléphone français
 *
 * @param {string} phone - Téléphone à valider
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  return /^0[1-9]\d{8}$/.test(phone);
};

/**
 * Formate une date pour l'API (YYYY-MM-DD)
 *
 * @param {Date} date - Date à formater
 * @returns {string}
 */
export const formatDateForAPI = (date) => {
  return date.toISOString().split("T")[0];
};

/**
 * Crée un objet de données de test vide
 *
 * @returns {Object}
 */
export const createEmptyTestData = () => ({
  admin: { token: null, user: null },
  user: { token: null, user: null },
  couleurs: {
    exterieur: [],
    interieur: [],
    accessoire: [],
  },
  tailles_jantes: [],
  voitures: {
    neuf: [],
    occasion: [],
  },
  modelPorsches: [],
  modelPorscheActuels: [],
  accessoires: [],
  photos: {
    voiture: [],
    porsche: [],
    accessoire: [],
    voiture_actuel: [],
  },
  reservations: [],
  commandes: [],
  lignesCommande: [],
  panier: null,
});

/**
 * Compare deux objets pour égalité partielle
 * Utile pour vérifier qu'une réponse contient au moins certains champs
 *
 * @param {Object} actual - Objet actuel
 * @param {Object} expected - Objet attendu (peut être partiel)
 * @returns {boolean}
 */
export const matchesPartial = (actual, expected) => {
  for (const key in expected) {
    if (actual[key] !== expected[key]) {
      return false;
    }
  }
  return true;
};

/**
 * Nettoie les propriétés undefined/null d'un objet
 *
 * @param {Object} obj - Objet à nettoyer
 * @returns {Object}
 */
export const cleanObject = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

/**
 * Génère un rapport de test formaté
 *
 * @param {Object} stats - Statistiques des tests
 * @returns {string}
 */
export const generateTestReport = (stats) => {
  const total = stats.passed + stats.failed + stats.skipped;
  const successRate = total > 0 ? ((stats.passed / total) * 100).toFixed(2) : 0;

  return `
╔════════════════════════════════════════════════════════════════╗
║                      RAPPORT DE TESTS                          ║
╠════════════════════════════════════════════════════════════════╣
║ Total:          ${total
    .toString()
    .padStart(4)} tests                                    ║
║ ✓ Réussis:      ${stats.passed
    .toString()
    .padStart(4)} tests                                    ║
║ ✗ Échoués:      ${stats.failed
    .toString()
    .padStart(4)} tests                                    ║
║ ⊗ Ignorés:      ${stats.skipped
    .toString()
    .padStart(4)} tests                                    ║
║ Taux de succès: ${successRate}%                                    ║
╚════════════════════════════════════════════════════════════════╝
  `;
};

/**
 * Assertions personnalisées pour les tests
 */
export const assertions = {
  /**
   * Vérifie qu'un objet est un utilisateur valide
   */
  isValidUser: (user) => {
    expect(user).toBeDefined();
    expect(user._id).toBeDefined();
    expect(isValidMongoId(user._id)).toBe(true);
    expect(isValidEmail(user.email)).toBe(true);
    expect(user.nom).toBeDefined();
    expect(user.prenom).toBeDefined();
  },

  /**
   * Vérifie qu'un objet est une voiture valide
   */
  isValidVoiture: (voiture) => {
    expect(voiture).toBeDefined();
    expect(voiture._id).toBeDefined();
    expect(isValidMongoId(voiture._id)).toBe(true);
    expect(voiture.nom_model).toBeDefined();
    expect(typeof voiture.prix).toBe("number");
    expect(voiture.prix).toBeGreaterThan(0);
    expect(typeof voiture.type_voiture).toBe("boolean");
  },

  /**
   * Vérifie qu'un objet est une couleur valide
   */
  isValidCouleur: (couleur) => {
    expect(couleur).toBeDefined();
    expect(couleur._id).toBeDefined();
    expect(isValidMongoId(couleur._id)).toBe(true);
    expect(couleur.nom_couleur).toBeDefined();
    expect(couleur.photo_couleur).toBeDefined();
  },

  /**
   * Vérifie qu'un objet est une réservation valide
   */
  isValidReservation: (reservation) => {
    expect(reservation).toBeDefined();
    expect(reservation._id).toBeDefined();
    expect(isValidMongoId(reservation._id)).toBe(true);
    expect(reservation.voiture).toBeDefined();
    expect(reservation.date_reservation).toBeDefined();
    expect(typeof reservation.status).toBe("boolean");
  },

  /**
   * Vérifie qu'un objet est une commande valide
   */
  isValidCommande: (commande) => {
    expect(commande).toBeDefined();
    expect(commande._id).toBeDefined();
    expect(isValidMongoId(commande._id)).toBe(true);
    expect(typeof commande.prix).toBe("number");
    expect(commande.prix).toBeGreaterThanOrEqual(0);
  },
};

export default {
  extractData,
  sleep,
  retryWithBackoff,
  isValidMongoId,
  isValidEmail,
  isValidPhone,
  formatDateForAPI,
  createEmptyTestData,
  matchesPartial,
  cleanObject,
  generateTestReport,
  assertions,
};
