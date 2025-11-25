/**
 * token.service.js — Gestion des tokens
 * - Lecture/écriture des tokens côté client.
 * - Permet d'authentifier les appels API côté serveur.
 */

const MEMORY = { token: null };

const TokenService = {
  setToken(token) {
    MEMORY.token = token || null;
    try {
      if (token) {
        sessionStorage.setItem("auth_token", token);
      } else {
        sessionStorage.removeItem("auth_token");
      }
    } catch (err) {
      // sessionStorage may be unavailable (privacy mode) — silently ignore
      // console.debug('token.setToken sessionStorage unavailable', err);
    }
  },

  getToken() {
    if (MEMORY.token) return MEMORY.token;
    try {
      const token = sessionStorage.getItem("auth_token");
      if (token) MEMORY.token = token;
      return token;
    } catch (err) {
      // sessionStorage unavailable or access denied
      return null;
    }
  },

  clear() {
    MEMORY.token = null;
    try {
      sessionStorage.removeItem("auth_token");
    } catch (err) {
      // ignore sessionStorage errors during clear
      // console.debug('token.clear sessionStorage unavailable', err);
    }
  },
};

export default TokenService;
