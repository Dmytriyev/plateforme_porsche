/**
 * utils/helpers.js — Fonctions utilitaires partagées (formatage, validation, sanitisation)
 *
 * - Centraliser helpers évite la duplication et facilite les tests unitaires.
 * - Sanitize côté client pour prévenir les XSS dans l'UI, mais faites aussi la sanitisation côté serveur.
 * - Fournir des helpers prédictibles (formatDate, formatPrice) améliore la cohérence UX.
 */

import DOMPurify from "dompurify";
// Importation de la bibliothèque pour la sanitisation HTML
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Erreur de connexion au serveur",
  UNAUTHORIZED: "Vous devez être connecté pour accéder à cette page",
  FORBIDDEN: "Vous n'avez pas les permissions nécessaires",
  NOT_FOUND: "Ressource non trouvée",
  SERVER_ERROR: "Erreur serveur, veuillez réessayer plus tard",
  VALIDATION_ERROR: "Erreur de validation des données",
};
// Messages d'erreur standardisés pour les erreurs API
const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
// Formatteur pour les prix en euros sans décimales
const priceMonthlyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
// Formatteur pour les prix mensuels en euros avec 2 décimales
const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
// Formatteur pour les dates au format français
const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
// Formatteur pour les dates et heures au format français
const numberFormatter = new Intl.NumberFormat("fr-FR");
// Formatteur pour les nombres au format français
export const formatPrice = (prix) => priceFormatter.format(prix);
export const formatPriceMonthly = (prix) => priceMonthlyFormatter.format(prix);
export const formatDate = (date) => dateFormatter.format(new Date(date));
export const formatDateTime = (date) =>
  dateTimeFormatter.format(new Date(date));
export const formatKilometrage = (km) => `${numberFormatter.format(km)} km`;
// Fonctions d'exportation pour le formatage des prix, dates et kilométrages
export const formatTelephone = (tel) => {
  if (!tel) return "";
  const cleaned = tel.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  return match
    ? `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`
    : tel;
};
// Fonction pour formater les numéros de téléphone français
export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

export const validateTelephone = (telephone) =>
  /^0[1-9](?:[\s.-]?\d{2}){4}$/.test(telephone);
// Fonctions de validation pour email, mot de passe, téléphone et code postal
export const validateCodePostal = (codePostal) => /^\d{5}$/.test(codePostal);

export const getPasswordErrors = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une minuscule");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une majuscule");
  }
  if (!/\d/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  }

  return errors;
};
// Fonction pour obtenir les erreurs de validation du mot de passe
const errorMap = {
  400: ERROR_MESSAGES.VALIDATION_ERROR,
  401: ERROR_MESSAGES.UNAUTHORIZED,
  403: ERROR_MESSAGES.FORBIDDEN,
  404: ERROR_MESSAGES.NOT_FOUND,
  500: ERROR_MESSAGES.SERVER_ERROR,
  502: ERROR_MESSAGES.SERVER_ERROR,
  503: ERROR_MESSAGES.SERVER_ERROR,
};
// Mapping des codes d'erreur HTTP aux messages d'erreur standardisés
export const handleApiError = (error) => {
  if (!error.response) return ERROR_MESSAGES.NETWORK_ERROR;
  const { status, data } = error.response;
  return data?.message || errorMap[status] || "Une erreur est survenue";
};
// Fonction pour gérer les erreurs API et retourner des messages appropriés
export const getErrorMessage = (error) =>
  typeof error === "string"
    ? error
    : error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Une erreur est survenue";

export const isAuthError = (error) => error?.response?.status === 401;

export const isValidationError = (error) => error?.response?.status === 400;

export const getValidationErrors = (error) => {
  const validationErrors = error?.response?.data?.errors;
  if (!validationErrors) return {};

  if (Array.isArray(validationErrors)) {
    return validationErrors.reduce((acc, err) => {
      if (err.param) acc[err.param] = err.msg;
      return acc;
    }, {});
  }

  return typeof validationErrors === "object" ? { ...validationErrors } : {};
};

export const setupConsoleFilter = () => {
  if (import.meta.env.DEV) {
    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = (...args) => {
      const message = args[0]?.toString() || "";
      if (
        message.includes("preload") ||
        message.includes("passive event listener") ||
        message.includes("scroll-blocking")
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      const message = args[0]?.toString() || "";
      if (
        message.includes("preload") ||
        message.includes("passive event listener") ||
        message.includes("runtime.lastError") ||
        message.includes("back/forward cache") ||
        message.includes("extension port")
      ) {
        return;
      }
      originalError.apply(console, args);
    };
  }
};

const defaultHTMLOptions = {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a"],
  ALLOWED_ATTR: ["href", "target", "rel"],
};

export const sanitizeHTML = (dirty, options = {}) =>
  dirty ? DOMPurify.sanitize(dirty, { ...defaultHTMLOptions, ...options }) : "";

export const sanitizeText = (text) =>
  text === null || text === undefined
    ? ""
    : DOMPurify.sanitize(String(text), { ALLOWED_TAGS: [] });

export const sanitizeURL = (url) =>
  !url || /^(javascript|data|vbscript):/i.test(url)
    ? ""
    : DOMPurify.sanitize(url, { ALLOWED_TAGS: [] });

export const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === "string"
        ? sanitizeText(item)
        : typeof item === "object"
        ? sanitizeObject(item)
        : item
    );
  }

  return Object.keys(obj).reduce((cleaned, key) => {
    const value = obj[key];
    cleaned[key] =
      typeof value === "string"
        ? sanitizeText(value)
        : typeof value === "object"
        ? sanitizeObject(value)
        : value;
    return cleaned;
  }, {});
};

export const validateLoginForm = (formData) => {
  const errors = {};
  if (!formData.email) errors.email = "L'email est requis";
  else if (!validateEmail(formData.email)) errors.email = "Email invalide";
  if (!formData.password) errors.password = "Le mot de passe est requis";
  return errors;
};

export const validateRegisterForm = (formData) => {
  const errors = {};
  if (!formData.prenom?.trim()) errors.prenom = "Le prénom est requis";
  if (!formData.nom?.trim()) errors.nom = "Le nom est requis";
  if (!formData.email) errors.email = "L'email est requis";
  else if (!validateEmail(formData.email)) errors.email = "Email invalide";
  if (formData.telephone && !validateTelephone(formData.telephone)) {
    errors.telephone = "Numéro de téléphone invalide";
  }
  if (!formData.password) errors.password = "Le mot de passe est requis";
  else if (!validatePassword(formData.password)) {
    errors.password = getPasswordErrors(formData.password)[0];
  }
  if (!formData.confirmPassword)
    errors.confirmPassword = "La confirmation du mot de passe est requise";
  else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas";
  }
  if (!formData.adresse?.trim())
    errors.adresse = "L'adresse postale est requise";
  if (!formData.codePostal?.trim())
    errors.codePostal = "Le code postal est requis";
  else if (!/^\d{5}$/.test(formData.codePostal)) {
    errors.codePostal = "Le code postal doit contenir 5 chiffres";
  }
  return errors;
};

export const handleFormChange = (setFormData, setErrors) => (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
  if (setErrors) setErrors((prev) => ({ ...prev, [name]: "" }));
};
