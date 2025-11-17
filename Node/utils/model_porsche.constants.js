// variantes disponibles par modèle Porsche et les types de carrosserie.
export const TYPES_CARROSSERIE = ["Coupe", "Cabriolet", "Targa", "SUV"];

export const VARIANTES_PAR_MODELE = {
  911: ["Carrera S", "GTS", "Turbo", "GT3", "GT3 RS", "Targa GTS", "Targa 4S"],
  Cayman: ["GTS", "GT4 RS"],
  Cayenne: ["E-Hybrid", "S", "GTS"],
};

// Liste des noms de modèles Porsche disponibles
export const NOMS_MODELES = Object.keys(VARIANTES_PAR_MODELE);
// Alias pour compatibilité (nom plus parlant utilisé dans l'API)
export const PORSCHE_MODELS = NOMS_MODELES;

// liste plate pour validation globale
export const TOUTES_VARIANTES = Object.values(VARIANTES_PAR_MODELE).flat();

// des types de carrosserie typiques par modèle
export const CARROSSERIES_PAR_MODELE = {
  911: ["Coupe", "Cabriolet", "Targa"],
  Cayman: ["Coupe"],
  Cayenne: ["SUV"],
};

// Vérifie si une variante est valide pour un modèle donné
export const isValidVariante = (nomModel, variante) => {
  const variantes = VARIANTES_PAR_MODELE[nomModel];
  return variantes ? variantes.includes(variante) : false;
};

export const isValidCarrosserie = (typeCarrosserie) => {
  return TYPES_CARROSSERIE.includes(typeCarrosserie);
};

// Vérifie si un type de carrosserie est compatible avec un modèle
export const isCarrosserieCompatible = (nomModel, typeCarrosserie) => {
  const carrosseries = CARROSSERIES_PAR_MODELE[nomModel];
  return carrosseries ? carrosseries.includes(typeCarrosserie) : false;
};
// Liste des variantes disponibles pour un modèle donné
export const getVariantesByModel = (nomModel) => {
  const variantes = VARIANTES_PAR_MODELE[nomModel] || [];
  return variantes.map((variante) => ({
    value: variante,
    label: variante,
  }));
};
// Liste des types de carrosserie disponibles
export const getAvailableCarrosseries = () => {
  return TYPES_CARROSSERIE.map((type) => ({
    value: type,
    label: type,
  }));
};

// Les carrosseries compatibles avec un modèle
export const getCarrosseriesByModel = (nomModel) => {
  const carrosseries = CARROSSERIES_PAR_MODELE[nomModel] || [];
  return carrosseries.map((type) => ({
    value: type,
    label: type,
  }));
};

// Les variantes avec leur modèle associé
export const getAllVariantesWithModel = () => {
  return Object.entries(VARIANTES_PAR_MODELE).reduce(
    (acc, [model, variantes]) => {
      variantes.forEach((variante) => {
        acc[variante] = model;
      });
      return acc;
    },
    {}
  );
};

// Descriptions structurées par modèle puis variante pour éviter les clés dupliquées
export const VARIANTE_DESCRIPTIONS = {
  911: {
    "Carrera S":
      "Version sportive équilibrée avec moteur 3.0L bi-turbo de 450 CV",
    GTS: "Version Gran Turismo Sport avec performances améliorées avec moteur 3.0L bi-turbo de 480 CV",
    Turbo: "Version turbo haute performance moteur 3.8L bi-turbo de 580 CV",
    GT3: "Version piste homologuée route avec moteur atmosphérique 4.0L de 500 CV",
    "GT3 RS":
      "Version ultime orientée piste avec aérodynamique optimisée avec moteur 4.0L bi-turbo de 520 CV",
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
// Récupère la description d'une variante pour un modèle donné
export const getVarianteDescription = (variante, nomModel = null) => {
  if (nomModel && VARIANTE_DESCRIPTIONS[nomModel]) {
    return VARIANTE_DESCRIPTIONS[nomModel][variante] || "";
  }
  // Recherche globale si le modèle n'est pas spécifié
  for (const model of Object.keys(VARIANTE_DESCRIPTIONS)) {
    if (
      Object.prototype.hasOwnProperty.call(
        VARIANTE_DESCRIPTIONS[model],
        variante
      )
    ) {
      return VARIANTE_DESCRIPTIONS[model][variante];
    }
  }
  return "";
};
