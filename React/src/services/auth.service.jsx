import apiClient from '../config/api.jsx';

/**
 * Service d'authentification
 * Gère la connexion, l'inscription et la gestion du token JWT
 */
const authService = {
  /**
   * Connexion utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise} Données utilisateur et token
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/user/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Inscription nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise} Données utilisateur et token
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post('/user/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Déconnexion utilisateur
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  /**
   * Récupérer le profil de l'utilisateur connecté
   * @returns {Promise} Profil utilisateur
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get('/user/profile');
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Mettre à jour le profil
   * @param {Object} userData - Nouvelles données utilisateur
   * @returns {Promise} Profil mis à jour
   */
  updateProfile: async (userData) => {
    try {
      const response = await apiClient.put('/user/profile', userData);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer l'utilisateur depuis le localStorage
   * @returns {Object|null} Utilisateur ou null
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Vérifier si l'utilisateur est connecté
   * @returns {boolean} true si connecté
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Récupérer le token JWT
   * @returns {string|null} Token ou null
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * Vérifier le rôle de l'utilisateur
   * @param {string} role - Rôle à vérifier
   * @returns {boolean} true si le rôle correspond
   */
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user?.role === role;
  },
};

export default authService;

