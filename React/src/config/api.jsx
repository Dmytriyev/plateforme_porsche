import axios from "axios";

// Configuration de base de l'API
// Note: Les variables d'environnement Vite doivent commencer par VITE_
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Instance axios configurée
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 secondes
});

// Intercepteur pour ajouter le token JWT aux requêtes
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject(error);
    }
    
    if (error.response?.status === 404 || error.response?.status === 400) {
      const url = error.config?.url || '';
      
      const silentRoutes = [
        '/model_porsche/occasion/page/',
      ];
      
      const shouldBeSilent = silentRoutes.some(route => url.includes(route));
      
      if (shouldBeSilent) {
        error.silent = true;
        error.isExpected = true;
        error.message = error.message || "Voiture d'occasion introuvable";
      }
    }
    
    return Promise.reject(error);
  }
);

export { apiClient, API_URL };
export default apiClient;
