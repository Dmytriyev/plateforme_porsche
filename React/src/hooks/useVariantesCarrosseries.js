// Hook personnalisé pour gérer les variantes et carrosseries des modèles de voitures Porsche
import { useState, useEffect, useMemo } from "react";

// Variantes prédéfinies par modèle (synchronisées avec le backend)
const VARIANTES_PAR_MODELE = {
  911: ["Carrera S", "GTS", "Turbo", "GT3", "GT3 RS", "Targa GTS", "Targa 4S"],
  Cayman: ["GTS", "GT4 RS"],
  Cayenne: ["E-Hybrid", "S", "GTS"],
};

// Carrosseries disponibles par modèle
const CARROSSERIES_PAR_MODELE = {
  911: ["Coupe", "Cabriolet", "Targa"],
  Cayman: ["Coupe"],
  Cayenne: ["SUV"],
};
// Hook personnalisé pour gérer les variantes et carrosseries
const useVariantesCarrosseries = (voitures, voitureId) => {
  // États pour les variantes et carrosseries disponibles
  const [variantesDisponibles, setVariantesDisponibles] = useState([]);
  // États pour les carrosseries disponibles
  const [carrosseriesDisponibles, setCarrosseriesDisponibles] = useState([]);
  // Trouver la voiture sélectionnée
  const voitureSelectionnee = useMemo(() => {
    return voitures.find((v) => v._id === voitureId);
  }, [voitures, voitureId]);

  // Mettre à jour les variantes et carrosseries quand la voiture change
  useEffect(
    () => {
      if (voitureSelectionnee) {
        // Récupérer le nom du modèle de la voiture sélectionnée
        const nomModele = voitureSelectionnee.nom_model || "";
        //   Récupérer les variantes et carrosseries pour ce modèle
        const variantes = VARIANTES_PAR_MODELE[nomModele] || [];
        //   Récupérer les carrosseries pour ce modèle
        const carrosseries = CARROSSERIES_PAR_MODELE[nomModele] || [];
        //    Mettre à jour les états avec les variantes et carrosseries disponibles
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVariantesDisponibles(variantes);

        setCarrosseriesDisponibles(carrosseries);
      } else {
        setVariantesDisponibles([]);

        setCarrosseriesDisponibles([]);
      }
    },
    // Mettre à jour quand la voiture sélectionnée change
    [voitureSelectionnee]
  );

  return {
    variantesDisponibles,
    carrosseriesDisponibles,
    voitureSelectionnee,
  };
};

export default useVariantesCarrosseries;
