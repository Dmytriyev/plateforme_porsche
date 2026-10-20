/**
 * useAccessoireFilter - Hook de filtrage des accessoires
 *
 * Principe : Logique de filtrage isolée
 *
 * @param {Array} accessoires - Liste des accessoires
 * @returns {Object} État et fonctions de filtrage
 */
import { useState, useMemo } from "react";

const useAccessoireFilter = (accessoires) => {
  const [filtreType, setFiltreType] = useState("tous");

  // Accessoires filtrés (mémoïsé)
  const accessoiresFiltres = useMemo(() => {
    if (filtreType === "tous") {
      return accessoires;
    }
    return accessoires.filter((acc) => acc.type_accesoire === filtreType);
  }, [accessoires, filtreType]);

  return {
    filtreType,
    setFiltreType,
    accessoiresFiltres,
  };
};

export default useAccessoireFilter;
