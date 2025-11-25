/**
 * services/httpHelper.js — Petit wrapper pour appels HTTP (axios)
 *
 * Notes pédagogiques :
 * - `apiRequest` centralise la gestion des erreurs et l'extraction des données.
 * - `returnArray` permet de normaliser les réponses paginées/imbriquées en tableau.
 * - `ignoreErrors` autorise à retourner une valeur par défaut pour certains codes HTTP.
 * - Avantage pour les étudiants : gardez la logique de gestion d'erreur en un point.
 */

const extractData = (response) => {
  if (!response?.data) return null;
  const { data } = response;
  return data?.data ?? data;
};

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
