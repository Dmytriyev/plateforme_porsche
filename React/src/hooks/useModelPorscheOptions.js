// Hook personnalisé pour gérer les options des modèles Porsche
import { useState, useEffect, useCallback } from "react";
import voitureService from "../services/voiture.service";
import personnalisationService from "../services/personnalisation.service";

const useModelPorscheOptions = () => {
  // États pour les options des modèles Porsche
  const [voitures, setVoitures] = useState([]);
  const [couleursExt, setCouleursExt] = useState([]);
  const [couleursInt, setCouleursInt] = useState([]);
  const [jantes, setJantes] = useState([]);
  const [sieges, setSieges] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  // Fonction pour charger les options des modèles Porsche
  const fetchOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      setOptionsError("");

      // Chargement parallèle de toutes les options
      const [
        voituresData,
        couleursExtData,
        couleursIntData,
        jantesData,
        siegesData,
        packagesData,
      ] = await Promise.all([
        voitureService.getVoituresOccasion(),
        personnalisationService.getCouleursExterieur(),
        personnalisationService.getCouleursInterieur(),
        personnalisationService.getJantes(),
        personnalisationService.getSieges(),
        personnalisationService.getPackages(),
      ]);
      // Mise à jour des états avec les données récupérées
      setVoitures(Array.isArray(voituresData) ? voituresData : []);
      setCouleursExt(Array.isArray(couleursExtData) ? couleursExtData : []);
      setCouleursInt(Array.isArray(couleursIntData) ? couleursIntData : []);
      setJantes(Array.isArray(jantesData) ? jantesData : []);
      setSieges(Array.isArray(siegesData) ? siegesData : []);
      setPackages(Array.isArray(packagesData) ? packagesData : []);
    } catch (err) {
      // Gestion des erreurs
      setOptionsError(err.message || "Erreur lors du chargement des options");
      setVoitures([]);
      setCouleursExt([]);
      setCouleursInt([]);
      setJantes([]);
      setSieges([]);
      setPackages([]);
    } finally {
      setLoadingOptions(false);
    }
  }, []);
  // Chargement initial des options
  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return {
    voitures,
    couleursExt,
    couleursInt,
    jantes,
    sieges,
    packages,
    loadingOptions,
    optionsError,
  };
};

export default useModelPorscheOptions;
