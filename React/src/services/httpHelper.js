/**
 * Extrait l'objet `data` normalisé depuis la réponse axios.
 * Retourne `null` si réponse invalide.
 */
const extractData = (response) => {
  if (!response?.data) return null;
  const { data } = response;
  return data?.data ?? data;
};

/**
 * Tente d'extraire un tableau depuis la réponse API.
 * Parcourt plusieurs clés connues pour trouver un tableau.
 */
const extractArray = (response) => {
  if (!response?.data) return [];

  const { data } = response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

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
 * Wrapper pour appels API qui normalise la réponse et gère les erreurs.
 * - `returnArray`: force l'extraction en tableau.
 * - `defaultValue`: valeur retournée si erreur ignorée.
 * - `ignoreErrors`: codes HTTP à ignorer (ex: 404).
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
    if (ignoreErrors.includes(error?.response?.status)) {
      return defaultValue;
    }
    throw error?.response?.data || error;
  }
};

export { extractData, extractArray };
