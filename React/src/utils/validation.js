/**
 * Utilitaires de validation
 */

/**
 * Valider un email
 * @param {string} email - Email à valider
 * @returns {boolean} true si valide
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valider un mot de passe
 * Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
 * @param {string} password - Mot de passe à valider
 * @returns {boolean} true si valide
 */
export const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

/**
 * Valider un numéro de téléphone français
 * @param {string} telephone - Téléphone à valider
 * @returns {boolean} true si valide
 */
export const validateTelephone = (telephone) => {
  const regex = /^0[1-9](?:[\s.-]?\d{2}){4}$/;
  return regex.test(telephone);
};

/**
 * Valider un code postal français
 * @param {string} codePostal - Code postal à valider
 * @returns {boolean} true si valide
 */
export const validateCodePostal = (codePostal) => {
  const regex = /^\d{5}$/;
  return regex.test(codePostal);
};

/**
 * Obtenir les messages d'erreur pour le mot de passe
 * @param {string} password - Mot de passe à vérifier
 * @returns {string[]} Liste des erreurs
 */
export const getPasswordErrors = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  return errors;
};

