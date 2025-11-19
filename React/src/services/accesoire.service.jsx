import apiClient from '../config/api.jsx';
import { extractData, extractArray, handleServiceError } from './httpHelper';

const accesoireService = {
  getAllAccessoires: async () => {
    try {
      const response = await apiClient.get('/accesoire/all');
      const data = extractArray(response);
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      return data;
    } catch (error) {
      return [];
    }
  },

  getAccessoireById: async (id) => {
    try {
      const response = await apiClient.get(`/accesoire/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getAccessoiresByType: async (type) => {
    try {
      const response = await apiClient.get(`/accesoire/search?type_accesoire=${encodeURIComponent(type)}`);
      const data = extractData(response);
      // Si la réponse contient accesoires, retourner ce tableau
      if (data && data.accesoires && Array.isArray(data.accesoires)) {
        return data.accesoires;
      }
      // Sinon, essayer extractArray qui gère plusieurs formats
      return extractArray(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getAvailableTypes: async () => {
    try {
      const response = await apiClient.get('/accesoire/types');
      // La réponse est maintenant standardisée avec sendSuccess, donc data contient directement les types
      const data = extractData(response);
      // Si data est un tableau, le retourner directement, sinon chercher dans data.data
      return Array.isArray(data) ? data : (data?.data || data || []);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  searchAccessoires: async (params) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/accesoire/search?${queryString}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getCouleurs: async () => {
    try {
      const response = await apiClient.get('/couleur_accesoire/all');
      return extractArray(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  createAccessoire: async (data) => {
    try {
      const response = await apiClient.post('/accesoire/new', data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  updateAccessoire: async (id, data) => {
    try {
      const response = await apiClient.put(`/accesoire/update/${id}`, data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  deleteAccessoire: async (id) => {
    try {
      const response = await apiClient.delete(`/accesoire/delete/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  addImages: async (id, photoIds) => {
    try {
      const response = await apiClient.patch(`/accesoire/addImage/${id}`, {
        photo_accesoire: photoIds,
      });
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  removeImages: async (id, photoIds) => {
    try {
      const response = await apiClient.patch(`/accesoire/removeImages/${id}`, {
        photo_accesoire: photoIds,
      });
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  setCouleur: async (id, couleurId) => {
    try {
      const response = await apiClient.patch(`/accesoire/addCouleur/${id}`, {
        couleur_accesoire: couleurId,
      });
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  removeCouleur: async (id) => {
    try {
      const response = await apiClient.patch(`/accesoire/removeCouleur/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },
};

export default accesoireService;
