/**
 * httpHelper.js — Helpers HTTP
 * - Centralise les appels HTTP et gestion d'erreurs.
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
