/**
 * hooks/usePanierAPI.jsx — Hook pour actions liées au panier
 *
 * Notes pédagogiques :
 * - Encapsule la logique du panier : lecture du nombre d'articles et actions d'ajout.
 * - Exemple d'un patron utile pour étudiants : garder la logique métier hors des composants UI.
 * - Le hook utilise le contexte `AuthContext` pour protéger les actions nécessitant l'auth.
 */

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import commandeService from "../services/commande.service.js";

const usePanierAPI = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [nombreArticles, setNombreArticles] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNombreArticles = async () => {
    try {
      const data = await commandeService.getPanier();
      const lignes = data?.lignesCommande || [];
      const total = lignes.reduce(
        (sum, ligne) => sum + (ligne.quantite || 1),
        0,
      );
      setNombreArticles(total);
    } catch (error) {
      setNombreArticles(0);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      fetchNombreArticles();
    } else {
      setNombreArticles(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const ajouterAccessoire = async (accessoireId, quantite = 1) => {
    if (!isAuthenticated()) {
      throw new Error("Authentification requise");
    }

    setLoading(true);
    try {
      await commandeService.ajouterAccessoireAuPanier(accessoireId, quantite);
      await fetchNombreArticles();
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const ajouterVoiture = async (modelPorscheId) => {
    if (!isAuthenticated()) {
      throw new Error("Authentification requise");
    }

    setLoading(true);
    try {
      await commandeService.ajouterVoitureNeuveAuPanier(modelPorscheId);
      await fetchNombreArticles();
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const rafraichirPanier = async () => {
    await fetchNombreArticles();
  };

  return {
    nombreArticles,
    loading,
    ajouterAccessoire,
    ajouterVoiture,
    rafraichirPanier,
  };
};

export default usePanierAPI;
