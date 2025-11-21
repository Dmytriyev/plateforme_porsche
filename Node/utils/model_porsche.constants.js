/**
 * Constantes pour les modèles Porsche
 * Définit les variantes, carrosseries et leurs validations
 */

// Types de carrosserie disponibles
export const TYPES_CARROSSERIE = ["Coupe", "Cabriolet", "Targa", "SUV"];

// Variantes disponibles par modèle
export const VARIANTES_PAR_MODELE = {
  911: ["Carrera S", "GTS", "Turbo", "GT3", "GT3 RS", "Targa GTS", "Targa 4S"],
  Cayman: ["GTS", "GT4 RS"],
  Cayenne: ["E-Hybrid", "S", "GTS"],
};

// Liste des modèles Porsche (alias: NOMS_MODELES)
export const PORSCHE_MODELS = Object.keys(VARIANTES_PAR_MODELE);
export const NOMS_MODELES = PORSCHE_MODELS;

// Liste plate de toutes les variantes
export const TOUTES_VARIANTES = Object.values(VARIANTES_PAR_MODELE).flat();

// Carrosseries typiques par modèle
export const CARROSSERIES_PAR_MODELE = {
  911: ["Coupe", "Cabriolet", "Targa"],
  Cayman: ["Coupe"],
  Cayenne: ["SUV"],
};

/**
 * Vérifie si une variante est valide pour un modèle
 */
export const isValidVariante = (nomModel, variante) => {
  return VARIANTES_PAR_MODELE[nomModel]?.includes(variante) || false;
};

/**
 * Vérifie si un type de carrosserie est valide
 */
export const isValidCarrosserie = (typeCarrosserie) => {
  return TYPES_CARROSSERIE.includes(typeCarrosserie);
};

/**
 * Vérifie la compatibilité carrosserie/modèle
 */
export const isCarrosserieCompatible = (nomModel, typeCarrosserie) => {
  return CARROSSERIES_PAR_MODELE[nomModel]?.includes(typeCarrosserie) || false;
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

/**
 * Retourne un mapping variante -> modèle
 */
export const getAllVariantesWithModel = () => {
  const mapping = {};
  Object.entries(VARIANTES_PAR_MODELE).forEach(([model, variantes]) => {
    variantes.forEach((variante) => {
      mapping[variante] = model;
    });
  });
  return mapping;
};

// Descriptions des variantes par modèle
export const VARIANTE_DESCRIPTIONS = {
  911: {
    "Carrera S":
      "Version sportive équilibrée avec moteur 3.0L bi-turbo de 450 CV",
    GTS: "Version Gran Turismo Sport avec moteur 3.0L bi-turbo de 480 CV",
    Turbo: "Version turbo haute performance moteur 3.8L bi-turbo de 580 CV",
    GT3: "Version piste homologuée route avec moteur 4.0L de 500 CV",
    "GT3 RS":
      "Version ultime orientée piste avec moteur 4.0L bi-turbo de 520 CV",
  },
  Cayman: {
    GTS: "Version Gran Turismo Sport du Cayman avec 365 CV",
    "GT4 RS":
      "Version RS ultra-sportive orientée piste avec moteur 4.0L bi-turbo de 420 CV",
  },
  Cayenne: {
    "E-Hybrid":
      "Version hybride rechargeable alliant performance et efficience de 340 CV",
    S: "Version sportive du SUV Cayenne avec moteur V6 bi-turbo de 440 CV",
    GTS: "Version Gran Turismo Sport du Cayenne avec moteur V8 bi-turbo de 460 CV",
  },
};

/**
 * Récupère la description d'une variante
 * @param {string} variante - Nom de la variante
 * @param {string} nomModel - Nom du modèle (optionnel)
 */
export const getVarianteDescription = (variante, nomModel = null) => {
  // Si le modèle est spécifié, chercher directement
  if (nomModel && VARIANTE_DESCRIPTIONS[nomModel]?.[variante]) {
    return VARIANTE_DESCRIPTIONS[nomModel][variante];
  }

  // Recherche globale
  for (const model in VARIANTE_DESCRIPTIONS) {
    if (VARIANTE_DESCRIPTIONS[model][variante]) {
      return VARIANTE_DESCRIPTIONS[model][variante];
    }
  }

  return "";
};
