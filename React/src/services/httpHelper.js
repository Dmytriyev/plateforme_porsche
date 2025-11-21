/**
 * Helpers HTTP pour les requêtes API
 * Gère l'extraction des données et les erreurs de manière standardisée
 */

/**
 * Extrait les données d'une réponse API
 * @param {Object} response - Réponse Axios
 * @returns {*} Les données extraites ou null
 */
const extractData = (response) => {
  if (!response?.data) return null;
  const { data } = response;
  return data?.data ?? data;
};

/**
 * Extrait un tableau de données d'une réponse API
 * Cherche dans différents emplacements possibles
 * @param {Object} response - Réponse Axios
 * @returns {Array} Le tableau extrait ou []
 */
const extractArray = (response) => {
  if (!response?.data) return [];

  const { data } = response;

  // Cas simple: data est déjà un tableau
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

  // Chercher dans les clés courantes
  const extracted = data?.data || data;
  const arrayKeys = [
    "configurations",
    "voitures",
    "accesoires",
    "items",
    "results",
    "porsches",
  ];

  for (const key of arrayKeys) {
    if (Array.isArray(extracted?.[key])) {
      return extracted[key];
    }
  }

  return [];
};

/**
 * Wrapper pour les requêtes API avec gestion d'erreurs
 * @param {Function} requestFn - Fonction de requête à exécuter
 * @param {Object} options - Options de configuration
 * @param {boolean} options.returnArray - Retourner un tableau
 * @param {*} options.defaultValue - Valeur par défaut en cas d'erreur ignorée
 * @param {Array<number>} options.ignoreErrors - Codes HTTP à ignorer
 * @returns {Promise<*>} Les données extraites
 */
export const apiRequest = async (requestFn, options = {}) => {
  const {
    returnArray = false,
    defaultValue = null,
    ignoreErrors = [],
  } = options;

  try {
    const response = await requestFn();
    return returnArray ? extractArray(response) : extractData(response);
  } catch (error) {
    // Ignorer certains codes d'erreur et retourner la valeur par défaut
    if (ignoreErrors.includes(error?.response?.status)) {
      return defaultValue;
    }
    throw error?.response?.data || error;
  }
};

export { extractData, extractArray };
