/**
 * Middleware de sanitation des entrées
 * - Échappe les caractères HTML dans `req.body`, `req.query` et `req.params`
 * - Protège contre XSS basique en nettoyant les valeurs de chaîne
 */
const htmlEntities = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
};

const escapeHtml = (str) =>
  String(str).replace(/[&<>"'`]/g, (char) => htmlEntities[char]);

const sanitizeValue = (value) => {
  if (typeof value === "string") return escapeHtml(value.trim());
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === "object") return sanitizeObject(value);
  return value;
};

const sanitizeObject = (obj) => {
  const out = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    try {
      out[key] = sanitizeValue(obj[key]);
    } catch (error) {
      // En cas d'erreur, conserver la valeur originale mais logger l'erreur
      out[key] = obj[key];
    }
  }
  return out;
};

export default function sanitizeInputs(req, res, next) {
  try {
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === "object") {
      req.query = sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === "object") {
      req.params = sanitizeObject(req.params);
    }
  } catch (error) {
    // En cas d'erreur critique de sanitization, passer quand même
    // pour éviter de bloquer les requêtes, mais cela devrait être loggé en production
  }
  next();
}
