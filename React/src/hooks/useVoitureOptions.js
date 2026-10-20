// Hook personnalisé pour gérer les options de voiture
import { useState, useEffect, useCallback } from "react";
import personnalisationService from "../services/personnalisation.service";

const useVoitureOptions = () => {
  // États pour les options de la voiture
  const [couleursExt, setCouleursExt] = useState([]);
  const [couleursInt, setCouleursInt] = useState([]);
  const [jantes, setJantes] = useState([]);
  const [sieges, setSieges] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  // Fonction pour charger les options de la voiture
  const fetchOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      setOptionsError("");
      // Chargement parallèle de toutes les options
      const [couleursExtData, couleursIntData, jantesData, siegesData] =
        await Promise.all([
          // Appels aux services pour récupérer les options
          personnalisationService.getCouleursExterieur(),
          personnalisationService.getCouleursInterieur(),
          personnalisationService.getJantes(),
          personnalisationService.getSieges(),
        ]);
      // Mise à jour des états avec les données récupérées
      setCouleursExt(Array.isArray(couleursExtData) ? couleursExtData : []);
      setCouleursInt(Array.isArray(couleursIntData) ? couleursIntData : []);
      setJantes(Array.isArray(jantesData) ? jantesData : []);
      setSieges(Array.isArray(siegesData) ? siegesData : []);
    } catch (err) {
      // Gestion des erreurs
      setOptionsError(err.message || "Erreur lors du chargement des options");
      setCouleursExt([]);
      setCouleursInt([]);
      setJantes([]);
      setSieges([]);
    } finally {
      setLoadingOptions(false);
    }
  }, []);
  // Chargement initial des options
  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return {
    couleursExt,
    couleursInt,
    jantes,
    sieges,
    loadingOptions,
    optionsError,
  };
};

export default useVoitureOptions;
