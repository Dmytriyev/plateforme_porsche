// Hook personnalisé pour gérer les voitures de l'utilisateur
import { useState, useEffect, useCallback } from "react";
import maVoitureService from "../services/ma_voiture.service";
import { warn } from "../utils/logger";

const useMesVoitures = (user) => {
  // États pour les voitures, le chargement, les erreurs et les succès
  const [voitures, setVoitures] = useState([]);
  //  États pour les voitures, le chargement, les erreurs et les succès
  const [loading, setLoading] = useState(true);
  //   État de chargement
  const [error, setError] = useState("");
  //   État d'erreur
  const [success, setSuccess] = useState("");
  // Charger les voitures
  const fetchMesVoitures = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    //   Charger les voitures de l'utilisateur
    try {
      setLoading(true);
      setError("");
      //     Appel au service pour récupérer les voitures
      const data = await maVoitureService.getMesVoitures();
      //   Mise à jour de l'état avec les données reçues
      setVoitures(Array.isArray(data) ? data : []);
    } catch (err) {
      warn("Erreur chargement mes voitures:", err);
      setError(err.message || "Erreur lors du chargement de vos voitures");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Charger au montage
  useEffect(() => {
    fetchMesVoitures();
  }, [fetchMesVoitures]);

  // Supprimer une voiture
  const supprimerVoiture = useCallback(
    async (voitureId, _voiture) => {
      try {
        setError("");
        // Supprimer la voiture via le service
        await maVoitureService.supprimerMaVoiture(voitureId);
        // Succès
        setSuccess("Voiture supprimée avec succès");
        setTimeout(() => setSuccess(""), 3000);

        // Recharger la liste
        await fetchMesVoitures();
      } catch (err) {
        warn("Erreur suppression voiture:", err);
        setError(err.message || "Erreur lors de la suppression");
        throw err;
      }
    },
    [fetchMesVoitures]
  );

  return {
    voitures,
    loading,
    error,
    success,
    fetchMesVoitures,
    supprimerVoiture,
    setError,
    setSuccess,
  };
};

export default useMesVoitures;
