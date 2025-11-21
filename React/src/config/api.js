/**
 * Configuration du client HTTP Axios
 * Gère les intercepteurs pour l'authentification et les erreurs
 */
import axios from "axios";
import TokenService from "../services/token.service.js";

// URL de l'API backend
export const API_URL =
  import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "";

// Client Axios configuré
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  withCredentials: true,
});

/**
 * Intercepteur de requête - Ajoute le token JWT
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Intercepteur de réponse - Gère l'expiration du token
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expiré ou invalide -> rediriger vers login
    if (error.response?.status === 401) {
      TokenService.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
