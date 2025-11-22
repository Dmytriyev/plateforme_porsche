// Types de carrosserie disponibles
export const TYPES_CARROSSERIE = ["Coupe", "Cabriolet", "Targa", "SUV"];

// Variantes disponibles par modèle
export const VARIANTES_PAR_MODELE = {
  911: ["Carrera S", "GTS", "Turbo", "GT3", "GT3 RS", "Targa GTS", "Targa 4S"],
  Cayman: ["GTS", "GT4 RS"],
  Cayenne: ["E-Hybrid", "S", "GTS"],
};

// Liste des modèles Porsche
export const PORSCHE_MODELS = Object.keys(VARIANTES_PAR_MODELE);

// Liste plate de toutes les variantes
export const TOUTES_VARIANTES = Object.values(VARIANTES_PAR_MODELE).flat();

// Carrosseries typiques par modèle
export const CARROSSERIES_PAR_MODELE = {
  911: ["Coupe", "Cabriolet", "Targa"],
  Cayman: ["Coupe"],
  Cayenne: ["SUV"],
};

/**
 * Retourne les variantes d'un modèle au format {value, label}
 */
export const getVariantesByModel = (nomModel) => {
  return (VARIANTES_PAR_MODELE[nomModel] || []).map((variante) => ({
    value: variante,
    label: variante,
  }));
};

/**
 * Retourne tous les types de carrosserie au format {value, label}
 */
export const getAvailableCarrosseries = () => {
  return TYPES_CARROSSERIE.map((type) => ({
    value: type,
    label: type,
  }));
};

/**
 * Retourne les carrosseries d'un modèle au format {value, label}
 */
export const getCarrosseriesByModel = (nomModel) => {
  return (CARROSSERIES_PAR_MODELE[nomModel] || []).map((type) => ({
    value: type,
    label: type,
  }));
};
