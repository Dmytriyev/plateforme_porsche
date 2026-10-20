/**
 * — Gestion des tokens
 * - Lecture/écriture des tokens côté client.
 * - Permet d'authentifier les appels API côté serveur.
 */

// Token stocké en mémoire pour éviter les accès répétitifs à sessionStorage
const MEMORY = { token: null, refreshToken: null };

// Clés utilisées dans sessionStorage
const KEY_ACCESS = "auth_token";
const KEY_REFRESH = "refresh_token";

// Service de gestion des tokens (access et refresh)
const TokenService = {
  setToken(token) {
    MEMORY.token = token || null;
    try {
      if (token) sessionStorage.setItem(KEY_ACCESS, token);
      else sessionStorage.removeItem(KEY_ACCESS);
    } catch (err) {}
  },

  // Récupère le token d'accès depuis la mémoire ou le sessionStorage
  getToken() {
    if (MEMORY.token) return MEMORY.token;
    try {
      const token = sessionStorage.getItem(KEY_ACCESS);
      if (token) MEMORY.token = token;
      return token;
    } catch (err) {
      return null;
    }
  },

  // Gestion du refresh token
  setRefreshToken(refreshToken) {
    MEMORY.refreshToken = refreshToken || null;
    try {
      if (refreshToken) sessionStorage.setItem(KEY_REFRESH, refreshToken);
      else sessionStorage.removeItem(KEY_REFRESH);
    } catch (err) {}
  },

  // Récupère le refresh token depuis la mémoire ou le sessionStorage
  getRefreshToken() {
    if (MEMORY.refreshToken) return MEMORY.refreshToken;
    try {
      const token = sessionStorage.getItem(KEY_REFRESH);
      if (token) MEMORY.refreshToken = token;
      return token;
    } catch (err) {
      return null;
    }
  },

  // Met à jour access + refresh ensemble
  setTokens({ accessToken, refreshToken }) {
    this.setToken(accessToken);
    this.setRefreshToken(refreshToken);
  },

  // Supprime les tokens de la mémoire et du sessionStorage
  clear() {
    MEMORY.token = null;
    MEMORY.refreshToken = null;
    try {
      sessionStorage.removeItem(KEY_ACCESS);
      sessionStorage.removeItem(KEY_REFRESH);
    } catch (err) {}
  },
};

export default TokenService;
