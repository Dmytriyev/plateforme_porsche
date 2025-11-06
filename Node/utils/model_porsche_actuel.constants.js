//  Constantes pour les modèles Porsche actuels (voitures d'occasion/propriété utilisateur)

// Types de carrosserie disponibles pour les voitures actuelles
export const TYPES_CARROSSERIE_ACTUEL = ["Coupe", "Cabriolet", "Targa", "SUV"];

// Types de transmission disponibles
export const TYPES_TRANSMISSION = ["Manuelle", "PDK", "Tiptronic"];

// Validation: type de carrosserie
export const isValidCarrosserieActuel = (typeCarrosserie) => {
  return TYPES_CARROSSERIE_ACTUEL.includes(typeCarrosserie);
};

// Validation: type de transmission
export const isValidTransmission = (transmission) => {
  return TYPES_TRANSMISSION.includes(transmission);
};

// Liste formatée pour React/Frontend - Carrosseries
export const TYPES_CARROSSERIE_ACTUEL_OPTIONS = TYPES_CARROSSERIE_ACTUEL.map(
  (type) => ({
    value: type,
    label: type,
  })
);

// Liste formatée pour React/Frontend - Transmissions
export const TYPES_TRANSMISSION_OPTIONS = TYPES_TRANSMISSION.map((type) => ({
  value: type,
  label: type,
}));

// Descriptions détaillées des types de transmission
export const TRANSMISSION_DESCRIPTIONS = {
  Manuelle: "Boîte manuelle 6 ou 7 rapports - expérience de conduite pure",
  PDK: "Porsche Doppelkupplung (double embrayage) - changements ultra-rapides",
  Tiptronic:
    "Transmission automatique avec mode manuel - confort et polyvalence",
};

export const getTransmissionDescription = (transmission) => {
  return TRANSMISSION_DESCRIPTIONS[transmission] || "";
};
