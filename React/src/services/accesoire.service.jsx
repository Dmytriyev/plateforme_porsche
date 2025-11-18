import apiClient from '../config/api.jsx';

// Service pour gérer les accessoires
export const accesoireService = {
    // Récupérer les accessoires
    getAllAccessoires: async () => {
        const response = await apiClient.get('/accesoire');
        return response.data;
    },

};

export default accesoireService;
