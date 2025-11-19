import apiClient from '../config/api.jsx';
import { extractData, extractArray, handleServiceError } from './httpHelper';

const personnalisationService = {
  getCouleursExterieur: async () => {
    try {
      const response = await apiClient.get('/couleur_exterieur/all');
      return extractArray(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getCouleurExterieurById: async (id) => {
    try {
      const response = await apiClient.get(`/couleur_exterieur/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getCouleursInterieur: async () => {
    try {
      const response = await apiClient.get('/couleur_interieur/all');
      return extractArray(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getCouleurInterieurById: async (id) => {
    try {
      const response = await apiClient.get(`/couleur_interieur/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getJantes: async () => {
    try {
      const response = await apiClient.get('/taille_jante/all');
      return extractArray(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getTaillesJante: async () => {
    try {
      const response = await apiClient.get('/taille_jante/all');
      return extractArray(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getTailleJanteById: async (id) => {
    try {
      const response = await apiClient.get(`/taille_jante/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getSieges: async () => {
    try {
      const response = await apiClient.get('/siege/all');
      return extractArray(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getSiegeById: async (id) => {
    try {
      const response = await apiClient.get(`/siege/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getPackages: async () => {
    try {
      const response = await apiClient.get('/package/all');
      return extractArray(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getPackageById: async (id) => {
    try {
      const response = await apiClient.get(`/package/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },
};

export default personnalisationService;
