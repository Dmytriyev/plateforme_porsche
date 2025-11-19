// TokenService centralise le stockage du token d'authentification.
// Stratégie : garder le token en mémoire par défaut (plus sûr contre XSS),
// et permettre une option de persistance en `sessionStorage` si nécessaire.

const MEMORY = { token: null };

const TokenService = {
  setToken(token, { persist = false } = {}) {
    MEMORY.token = token || null;
    try {
      if (persist && token) {
        sessionStorage.setItem("auth_token", token);
      } else {
        sessionStorage.removeItem("auth_token");
      }
    } catch (e) {
      // sessionStorage might be unavailable in some environments
    }
  },

  getToken() {
    if (MEMORY.token) return MEMORY.token;
    try {
      const t = sessionStorage.getItem("auth_token");
      if (t) {
        MEMORY.token = t;
        return t;
      }
    } catch (e) {
      // ignore
    }
    return null;
  },

  clear() {
    MEMORY.token = null;
    try {
      sessionStorage.removeItem("auth_token");
    } catch (e) {
      // ignore
    }
  },
};

export default TokenService;
