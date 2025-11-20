import axios from 'axios';
import TokenService from '../services/token.service.js';

// Configuration de base de l'API
// Note: Les variables d'environnement Vite doivent commencer par VITE_
// Par défaut on utilise une base relative (""), ce qui permet d'utiliser
// le proxy configuré dans Vite durant le développement. Pour pointer
// explicitement un backend distant, définissez `VITE_API_URL`.
const API_URL = import.meta.env.VITE_API_URL || '';

// Instance axios configurée
const apiClient = axios.create({
  // Si VITE_API_URL est vide, axios utilisera des chemins relatifs
  // (ex: '/voiture/all') ce qui permet au dev server Vite de proxifier
  // les requêtes vers l'API backend.
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 secondes
  // Envoyer les cookies pour l'authentification (nécessaire pour CORS avec credentials)
  withCredentials: true,
});

// Intercepteur pour ajouter le token JWT aux requêtes via TokenService
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenService.getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Intercepteur de réponses : centraliser 401 et erreurs attendues
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      TokenService.clear();
      // redirect to login in a controlled way
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (status === 404 || status === 400) {
      const url = error.config?.url || '';
      const silentRoutes = ['/model_porsche/occasion/page/'];
      const shouldBeSilent = silentRoutes.some((route) => url.includes(route));
      if (shouldBeSilent) {
        error.silent = true;
        error.isExpected = true;
        error.message = error.message || "Voiture d'occasion introuvable";
      }
    }
    return Promise.reject(error);
  },
);

export { apiClient, API_URL };
export default apiClient;
