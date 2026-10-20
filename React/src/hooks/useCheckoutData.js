// Hook personnalisé pour gérer les données de checkout
import { useState, useEffect, useCallback } from "react";
import commandeService from "../services/commande.service";
import { warn } from "../utils/logger";

const useCheckoutData = (user) => {
  // États pour le chargement, les erreurs, le panier et les lignes de commande
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [panier, setPanier] = useState(null);
  const [lignesCommande, setLignesCommande] = useState([]);

  // Charger les données du panier
  const fetchPanierData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Récupération des données du panier depuis le service
      const data = await commandeService.getPanier();
      // Validation données reçues
      if (!data || !data.lignesCommande || data.lignesCommande.length === 0) {
        setError("Votre panier est vide");
        setLoading(false);
        return;
      }
      //   Validation commande dans les données
      if (!data.commande?._id) {
        setError("Impossible de charger le panier");
        setLoading(false);
        return;
      }
      //   Mise à jour des états avec les données reçues
      setPanier(data.commande);
      //   Mise à jour des lignes de commande
      setLignesCommande(data.lignesCommande);
      setLoading(false);
    } catch (err) {
      warn("Erreur chargement panier checkout:", err);
      setError(err.message || "Erreur lors du chargement du panier");
      setLoading(false);
    }
  }, [user]);

  // Charger au montage
  useEffect(() => {
    fetchPanierData();
  }, [fetchPanierData]);

  // Créer session de paiement Stripe
  const createPaymentSession = useCallback(async (panierId) => {
    try {
      setError(null);
      //     Appel au service pour créer la session de paiement
      const response = await commandeService.createPaymentSession(panierId);
      //     Validation de la réponse du serveur
      if (!response?.url) {
        throw new Error("URL de paiement non reçue du serveur");
      }

      return response;
    } catch (err) {
      warn("Erreur création session paiement:", err);
      const errorMessage =
        err.message || "Erreur lors de la création de la session de paiement";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    loading,
    error,
    panier,
    lignesCommande,
    fetchPanierData,
    createPaymentSession,
    setError,
  };
};

export default useCheckoutData;
