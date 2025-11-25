/**
 * — Gestion des tokens
 * - Lecture/écriture des tokens côté client.
 * - Permet d'authentifier les appels API côté serveur.
 */

// Token stocké en mémoire pour éviter les accès répétitifs à sessionStorage
const MEMORY = { token: null };

// Service de gestion des tokens
const TokenService = {
  setToken(token) {
    // Met à jour le token en mémoire et dans sessionStorage
    MEMORY.token = token || null;
    // Met à jour sessionStorage
    try {
      if (token) {
        // Stocke le token
        sessionStorage.setItem("auth_token", token);
      } else {
        // Supprime si token est null/undefined
        sessionStorage.removeItem("auth_token");
      }
    } catch (err) {}
  },

  // Récupère le token depuis la mémoire ou sessionStorage
  getToken() {
    if (MEMORY.token) return MEMORY.token;
    try {
      // Récupère depuis sessionStorage
      const token = sessionStorage.getItem("auth_token");
      // Met à jour la mémoire
      if (token) MEMORY.token = token;
      return token;
    } catch (err) {
      return null;
    }
  },

  // Supprime le token de la mémoire et de sessionStorage
  clear() {
    MEMORY.token = null;
    try {
      // Supprime de sessionStorage
      sessionStorage.removeItem("auth_token");
    } catch (err) {}
  },
};

export default TokenService;
