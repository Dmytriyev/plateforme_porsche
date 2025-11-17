import apiClient from '../config/api';

// Service pour gérer les modèles Porsche
export const porscheService = {
  // Récupérer tous les modèles
  getAllModels: async () => {
    const response = await apiClient.get('/model_porsche');
    return response.data;
  },

  // Récupérer un modèle par ID
  getModelById: async (id) => {
    const response = await apiClient.get(`/model_porsche/${id}`);
    return response.data;
  },

  // Récupérer toutes les voitures
  getAllVoitures: async () => {
    const response = await apiClient.get('/voiture');
    return response.data;
  },

  // Récupérer les accessoires
  getAllAccessoires: async () => {
    const response = await apiClient.get('/accesoire');
    return response.data;
  },

  // Récupérer les couleurs intérieures
  getCouleursInterieur: async () => {
    const response = await apiClient.get('/couleur_interieur');
    return response.data;
  },

  // Récupérer les couleurs extérieures
  getCouleursExterieur: async () => {
    const response = await apiClient.get('/couleur_exterieur');
    return response.data;
  },

  // Récupérer les packages
  getPackages: async () => {
    const response = await apiClient.get('/package');
    return response.data;
  },

  // Récupérer les tailles de jante
  getTaillesJante: async () => {
    const response = await apiClient.get('/taille_jante');
    return response.data;
  },

  // Récupérer les sièges
  getSieges: async () => {
    const response = await apiClient.get('/siege');
    return response.data;
  },
};

export default porscheService;
