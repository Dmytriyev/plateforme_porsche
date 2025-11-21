import apiClient from "../config/api.js";
import { apiRequest } from "./httpHelper";

const staffService = {
  getVoituresOccasion: () =>
    apiRequest(() => apiClient.get("/staff/voitures-occasion")),
  ajouterVoitureOccasion: (data) =>
    apiRequest(() => apiClient.post("/staff/voitures-occasion", data)),
  modifierVoitureOccasion: (id, data) =>
    apiRequest(() => apiClient.put(`/staff/voitures-occasion/${id}`, data)),
  supprimerVoitureOccasion: (id) =>
    apiRequest(() => apiClient.delete(`/staff/voitures-occasion/${id}`)),
  getAccessoires: () => apiRequest(() => apiClient.get("/staff/accessoires")),
  ajouterAccessoire: (data) =>
    apiRequest(() => apiClient.post("/staff/accessoires", data)),
  modifierAccessoire: (id, data) =>
    apiRequest(() => apiClient.put(`/staff/accessoires/${id}`, data)),
  supprimerAccessoire: (id) =>
    apiRequest(() => apiClient.delete(`/staff/accessoires/${id}`)),
  getCommandes: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const url = `/staff/commandes${params ? `?${params}` : ""}`;
    return apiRequest(() => apiClient.get(url));
  },
  getDetailCommande: (id) =>
    apiRequest(() => apiClient.get(`/staff/commandes/${id}`)),
  mettreAJourPaiement: (id, data) =>
    apiRequest(() => apiClient.patch(`/staff/commandes/${id}/paiement`, data)),
  marquerCommeLivree: (id) =>
    apiRequest(() => apiClient.patch(`/staff/commandes/${id}/livree`)),
  accepterReservation: (id) =>
    apiRequest(() => apiClient.patch(`/reservation/${id}/accepter`)),
  refuserReservation: (id, motif) =>
    apiRequest(() => apiClient.patch(`/reservation/${id}/refuser`, { motif })),
  getDemandesParStatut: (statut) =>
    apiRequest(() => apiClient.get(`/contact/statut/${statut}`)),
  repondreDemandeContact: (id, reponse) =>
    apiRequest(() => apiClient.post(`/contact/${id}/repondre`, { reponse })),
  marquerDemandeTraitee: (id) =>
    apiRequest(() => apiClient.patch(`/contact/${id}/traitee`)),
};

export default staffService;
