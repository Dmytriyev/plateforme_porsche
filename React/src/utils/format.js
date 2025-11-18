/**
 * Utilitaires de formatage
 */

/**
 * Formater un prix en euros
 * @param {number} prix - Prix à formater
 * @returns {string} Prix formaté
 */
export const formatPrice = (prix) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(prix);
};

/**
 * Formater une date
 * @param {string|Date} date - Date à formater
 * @returns {string} Date formatée
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Formater une date avec l'heure
 * @param {string|Date} date - Date à formater
 * @returns {string} Date et heure formatées
 */
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Formater un kilométrage
 * @param {number} km - Kilométrage
 * @returns {string} Kilométrage formaté
 */
export const formatKilometrage = (km) => {
  return new Intl.NumberFormat('fr-FR').format(km) + ' km';
};

/**
 * Formater un numéro de téléphone français
 * @param {string} tel - Numéro de téléphone
 * @returns {string} Téléphone formaté
 */
export const formatTelephone = (tel) => {
  if (!tel) return '';
  const cleaned = tel.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
  }
  return tel;
};

