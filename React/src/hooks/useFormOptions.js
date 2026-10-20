// Hook personnalisé pour gérer les options du formulaire d'accessoire
import { useState, useEffect, useCallback } from "react";
import accesoireService from "../services/accesoire.service";
// Hook useFormOptions
const useFormOptions = () => {
  const [couleurs, setCouleurs] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  // Types disponibles (constante)
  const typesDisponibles = [
    { value: "porte-clés", label: "Porte-clés" },
    { value: "vetement", label: "Vêtement" },
    { value: "decoration", label: "Décoration" },
    { value: "life-style", label: "Life Style" },
  ];
  //   Récupération des options depuis l'API
  const fetchOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      setOptionsError("");
      // Récupérer les couleurs depuis l'API
      const couleursData = await accesoireService.getCouleurs();
      // Transformer en format pour select
      const couleursFormatees = Array.isArray(couleursData)
        ? couleursData.map((c) => ({
            value: c._id,
            label: c.nom_couleur,
          }))
        : [];
      setCouleurs(couleursFormatees);
    } catch (err) {
      setOptionsError(err.message || "Erreur chargement options");
      setCouleurs([]);
    } finally {
      setLoadingOptions(false);
    }
  }, []);
  // Chargement initial des options
  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return {
    couleurs,
    typesDisponibles,
    loadingOptions,
    optionsError,
  };
};

export default useFormOptions;
