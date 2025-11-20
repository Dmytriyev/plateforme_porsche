/**
 * sanitize.js
 * Centralise des utilitaires pour la sanitization (prévention XSS).
 * Utilise DOMPurify en runtime. Si DOMPurify n'est pas installé,
 * la fonction lancera une erreur lors de l'import, donc installez
 * `dompurify` en dev si nécessaire.
 */

import DOMPurify from "dompurify";

/**
 * Nettoyer une chaîne HTML pour prévenir les attaques XSS
 * @param {string} dirty - HTML à nettoyer
 * @param {Object} options - Options DOMPurify
 * @returns {string} HTML nettoyé
 */
export const sanitizeHTML = (dirty, options = {}) => {
  if (!dirty) return "";

  const defaultOptions = {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ...options,
  };

  return DOMPurify.sanitize(dirty, defaultOptions);
};

/**
 * Nettoyer un texte brut (supprime tout HTML)
 * @param {string} text - Texte à nettoyer
 * @returns {string} Texte nettoyé
 */
export const sanitizeText = (text) => {
  if (text === null || text === undefined) return "";
  return DOMPurify.sanitize(String(text), { ALLOWED_TAGS: [] });
};

/**
 * Nettoyer une URL pour prévenir les injections
 * @param {string} url - URL à nettoyer
 * @returns {string} URL nettoyée
 */
export const sanitizeURL = (url) => {
  if (!url) return "";

  // Bloquer javascript:, data:, vbscript: etc.
  const dangerous = /^(javascript|data|vbscript):/i;
  if (dangerous.test(url)) {
    return "";
  }

  return DOMPurify.sanitize(url, { ALLOWED_TAGS: [] });
};

/**
 * Nettoyer un objet récursivement
 * @param {Object} obj - Objet à nettoyer
 * @returns {Object} Objet nettoyé
 */
export const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;

  // Preserve arrays: sanitize each item and return a new array
  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (typeof item === "string") return sanitizeText(item);
      if (Array.isArray(item)) return sanitizeObject(item);
      if (typeof item === "object" && item !== null)
        return sanitizeObject(item);
      return item;
    });
  }

  if (typeof obj !== "object") return obj;

  const cleaned = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (typeof value === "string") {
        cleaned[key] = sanitizeText(value);
      } else if (Array.isArray(value)) {
        cleaned[key] = value.map((item) =>
          typeof item === "string" ? sanitizeText(item) : sanitizeObject(item)
        );
      } else if (typeof value === "object" && value !== null) {
        cleaned[key] = sanitizeObject(value);
      } else {
        cleaned[key] = value;
      }
    }
  }

  return cleaned;
};

export default {
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  sanitizeObject,
};
