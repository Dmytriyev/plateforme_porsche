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
    } catch {}
  },

  getToken() {
    if (MEMORY.token) return MEMORY.token;
    try {
      const token = sessionStorage.getItem("auth_token");
      if (token) MEMORY.token = token;
      return token;
    } catch {
      return null;
    }
  },

  clear() {
    MEMORY.token = null;
    try {
      sessionStorage.removeItem("auth_token");
    } catch {}
  },
};

export default TokenService;
