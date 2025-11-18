// config/api.js
// Configuration Axios pour communiquer avec le backend Node.js

import axios from 'axios';

// Créer une instance Axios avec configuration de base
const api = axios.create({
  // URL du backend (à modifier selon votre environnement)
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  
  // Timeout après 10 secondes
  timeout: 10000,
  
  // Headers par défaut
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// INTERCEPTEUR DE REQUÊTE
// ============================================
// Ajoute automatiquement le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis localStorage
    const token = localStorage.getItem('token');
    
    // Si le token existe, l'ajouter au header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('📤 Requête envoyée:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (erreur) => {
    console.error('❌ Erreur dans la requête:', erreur);
    return Promise.reject(erreur);
  }
);

// ============================================
// INTERCEPTEUR DE RÉPONSE
// ============================================
// Gère automatiquement les erreurs d'authentification
api.interceptors.response.use(
  (response) => {
    console.log('✅ Réponse reçue:', response.status, response.config.url);
    return response;
  },
  (erreur) => {
    // Si erreur 401 (Non autorisé) → déconnexion
    if (erreur.response?.status === 401) {
      console.warn('⚠️ Session expirée, déconnexion...');
      
      // Supprimer le token
      localStorage.removeItem('token');
      localStorage.removeItem('utilisateur');
      
      // Rediriger vers la page de connexion
      if (window.location.pathname !== '/connexion') {
        window.location.href = '/connexion';
      }
    }
    
    // Si erreur 403 (Accès interdit)
    if (erreur.response?.status === 403) {
      console.error('🚫 Accès refusé - Permissions insuffisantes');
    }
    
    // Si erreur 500 (Erreur serveur)
    if (erreur.response?.status === 500) {
      console.error('💥 Erreur serveur - Veuillez réessayer plus tard');
    }
    
    console.error('❌ Erreur de réponse:', erreur.response?.status, erreur.message);
    return Promise.reject(erreur);
  }
);

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Extraire le message d'erreur depuis la réponse
 * @param {Error} erreur - L'objet erreur Axios
 * @returns {string} - Message d'erreur lisible
 */
export const extraireMessageErreur = (erreur) => {
  if (erreur.response) {
    // Le serveur a répondu avec un code d'erreur
    return erreur.response.data?.message || erreur.response.data?.erreur || 'Une erreur est survenue';
  } else if (erreur.request) {
    // La requête a été envoyée mais pas de réponse
    return 'Impossible de contacter le serveur';
  } else {
    // Erreur lors de la configuration de la requête
    return erreur.message || 'Une erreur est survenue';
  }
};

/**
 * Vérifier si l'utilisateur est connecté
 * @returns {boolean}
 */
export const estConnecte = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Obtenir l'utilisateur connecté depuis localStorage
 * @returns {object|null}
 */
export const obtenirUtilisateur = () => {
  const utilisateur = localStorage.getItem('utilisateur');
  try {
    return utilisateur ? JSON.parse(utilisateur) : null;
  } catch (error) {
    console.error('Erreur parsing utilisateur:', error);
    return null;
  }
};

/**
 * Sauvegarder l'utilisateur dans localStorage
 * @param {object} utilisateur
 */
export const sauvegarderUtilisateur = (utilisateur) => {
  localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
};

/**
 * Sauvegarder le token dans localStorage
 * @param {string} token
 */
export const sauvegarderToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Déconnecter l'utilisateur
 */
export const deconnecter = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('utilisateur');
  window.location.href = '/connexion';
};

// Export de l'instance Axios par défaut
export default api;

