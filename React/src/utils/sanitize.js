/**
 * Utilitaires de sanitization pour la protection XSS
 */
import DOMPurify from 'dompurify';

/**
 * Nettoyer une chaîne HTML pour prévenir les attaques XSS
 * @param {string} dirty - HTML à nettoyer
 * @param {Object} options - Options DOMPurify
 * @returns {string} HTML nettoyé
 */
export const sanitizeHTML = (dirty, options = {}) => {
  if (!dirty) return '';
  
  const defaultOptions = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
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
  if (!text) return '';
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
};

/**
 * Nettoyer une URL pour prévenir les injections
 * @param {string} url - URL à nettoyer
 * @returns {string} URL nettoyée
 */
export const sanitizeURL = (url) => {
  if (!url) return '';
  
  // Bloquer javascript:, data:, vbscript: etc.
  const dangerous = /^(javascript|data|vbscript):/i;
  if (dangerous.test(url)) {
    return '';
  }
  
  return DOMPurify.sanitize(url, { ALLOWED_TAGS: [] });
};

/**
 * Nettoyer un objet récursivement
 * @param {Object} obj - Objet à nettoyer
 * @returns {Object} Objet nettoyé
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const cleaned = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        cleaned[key] = sanitizeText(value);
      } else if (Array.isArray(value)) {
        cleaned[key] = value.map(item => 
          typeof item === 'string' ? sanitizeText(item) : sanitizeObject(item)
        );
      } else if (typeof value === 'object' && value !== null) {
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

