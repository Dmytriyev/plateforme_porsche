/**
 * — Fonctions utilitaires partagées (formatage, validation, sanitisation)
 * - Centraliser helpers évite la duplication les tests unitaires.
 * - Sanitize côté client et côté serveur.
 * - Fournir des helpers prédictibles (formatDate, formatPrice)
 */
import DOMPurify from "dompurify";

// Importation de la bibliothèque pour la sanitisation HTML
const ERROR_MESSAGES = {
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

// Formatteur pour les prix en euros avec 2 décimales
const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Formatteur pour les dates au format français
export const formatPrice = (prix) => priceFormatter.format(prix);
export const formatDate = (date) => dateFormatter.format(new Date(date));

// Fonctions pour formater email
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// Fonction de validation pour password
const validatePassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
// Fonction de validation pour téléphone
const validateTelephone = (telephone) =>
  /^0[1-9](?:[\s.-]?\d{2}){4}$/.test(telephone);

// Fonction pour obtenir les erreurs de validation du mot de passe
const getPasswordErrors = (password) => {
  const errors = [];
  // Vérifie les critères du mot de passe et retourne les messages d'erreur correspondants
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
export const setupConsoleFilter = () => {
  // Filtrer les warnings et erreurs non critiques
  if (import.meta.env.DEV) {
    const originalWarn = console.warn;
    const originalError = console.error;
    // Sauvegarder les fonctions originales
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
    // Redéfinir console.warn pour filtrer certains messages
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
// Configurer le filtrage de la console pour ignorer certains warnings non critiques
// DOMPurify : une bibliothèque JavaScript qui nettoie (sanitize) du HTML pour prévenir les failles XSS
const sanitizeText = (text) =>
  text === null || text === undefined
    ? ""
    : DOMPurify.sanitize(String(text), { ALLOWED_TAGS: [] });

// Sanitiser une chaîne de texte en supprimant les balises HTML
export const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined || typeof obj !== "object") return obj;
  // Retourner l'objet tel quel s'il n'est pas un objet valide
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === "string"
        ? sanitizeText(item)
        : typeof item === "object"
        ? sanitizeObject(item)
        : item
    );
  }
  // Sanitiser récursivement les propriétés de l'objet
  return Object.keys(obj).reduce((cleaned, key) => {
    const value = obj[key];
    // Sanitiser en fonction du type de la valeur
    cleaned[key] =
      typeof value === "string"
        ? sanitizeText(value)
        : typeof value === "object"
        ? sanitizeObject(value)
        : value;
    return cleaned;
  }, {});
};
// Fonction pour sanitiser récursivement un objet ou un tableau
export const validateLoginForm = (formData) => {
  const errors = {};
  // Valider les champs du formulaire de connexion
  if (!formData.email) errors.email = "L'email est requis";
  else if (!validateEmail(formData.email)) errors.email = "Email invalide";
  if (!formData.password) errors.password = "Le mot de passe est requis";
  return errors;
};

// Fonction pour valider les données du formulaire d'inscription
export const validateRegisterForm = (formData) => {
  const errors = {};
  // Valider les champs du formulaire d'inscription
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

// Fonction pour valider les données du formulaire d'inscription
export const handleFormChange = (setFormData, setErrors) => (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
  if (setErrors) setErrors((prev) => ({ ...prev, [name]: "" }));
};
