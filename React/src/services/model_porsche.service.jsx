import apiClient from '../config/api.jsx';

/**
 * Service pour la gestion des modèles Porsche neufs et configuration
 */
const modelPorscheService = {
  /**
   * Récupérer tous les modèles Porsche disponibles
   */
  getAllModels: async () => {
    const response = await apiClient.get('/model_porsche');
    return response.data;
  },

  /**
   * Récupérer un modèle par son ID
   */
  getById: async (id) => {
    const response = await apiClient.get(`/model_porsche/${id}`);
    return response.data;
  },

  /**
   * Récupérer les variantes disponibles pour un modèle de voiture
   * @param {string} voitureId - ID du modèle de base (911, Cayenne, etc.)
   */
  getVariantesByModel: async (voitureId) => {
    const response = await apiClient.get(`/model_porsche/variantes/${voitureId}`);
    return response.data;
  },

  /**
   * Créer une nouvelle configuration de modèle Porsche
   */
  createConfiguration: async (configData) => {
    const response = await apiClient.post('/model_porsche', configData);
    return response.data;
  },

  /**
   * Mettre à jour une configuration
   */
  updateConfiguration: async (id, configData) => {
    const response = await apiClient.put(`/model_porsche/${id}`, configData);
    return response.data;
  },

  /**
   * Supprimer une configuration
   */
  deleteConfiguration: async (id) => {
    const response = await apiClient.delete(`/model_porsche/${id}`);
    return response.data;
  },

  /**
   * Calculer le prix total d'une configuration
   */
  calculatePrice: async (id) => {
    const response = await apiClient.get(`/model_porsche/${id}/prix`);
    return response.data;
  },

  /**
   * Obtenir le résumé complet d'une configuration
   */
  getResume: async (id) => {
    const response = await apiClient.get(`/model_porsche/${id}/resume`);
    return response.data;
  },

  /**
   * Rechercher par spécifications techniques
   */
  searchBySpecs: async (criteria) => {
    const response = await apiClient.post('/model_porsche/search', criteria);
    return response.data;
  },

  /**
   * Obtenir les types de carrosserie disponibles
   */
  getCarrosserieTypes: () => {
    return ['Coupé', 'Cabriolet', 'Targa', 'Speedster'];
  },
};

export default modelPorscheService;

