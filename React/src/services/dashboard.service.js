import apiClient from "../config/api.js";
import { apiRequest } from "./httpHelper";

const dashboardService = {
  getDashboardComplet: () =>
    apiRequest(() => apiClient.get("/dashboard/complet")),
  getStatistiques: () =>
    apiRequest(() => apiClient.get("/dashboard/statistiques")),
  getReservationsEnAttente: () =>
    apiRequest(() => apiClient.get("/dashboard/reservations-en-attente")),
  getCommandesEnCours: () =>
    apiRequest(() => apiClient.get("/dashboard/commandes-en-cours")),
  getDemandesNonTraitees: () =>
    apiRequest(() => apiClient.get("/dashboard/demandes-non-traitees")),
  getActivitesRecentes: () =>
    apiRequest(() => apiClient.get("/dashboard/activites-recentes")),
};

export default dashboardService;
