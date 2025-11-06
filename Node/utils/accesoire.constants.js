// les types d'accessoires prédéfinis
export const TYPES_ACCESOIRE = [
  "porte-clés",
  "vetement",
  "decoration",
  "life-style",
];
export const DEFAULT_TYPE_ACCESOIRE = TYPES_ACCESOIRE[0];
export const isValidTypeAccesoire = (type) => {
  return TYPES_ACCESOIRE.includes(type);
};

// la liste des types d'accessoires disponibles
export const getAvailableTypesAccesoire = () => {
  return TYPES_ACCESOIRE.map((type) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
  }));
};
export const TYPE_ACCESOIRE_DESCRIPTIONS = {
  porte_cles: "Porte-clés aux couleurs Porsche",
  vetement: "Vêtements et textiles collection Porsche",
  decoration: "Objets décoratifs et miniatures de collection",
  life_style: "Articles lifestyle et accessoires du quotidien",
};
export const getTypeAccesoireDescription = (type) => {
  return TYPE_ACCESOIRE_DESCRIPTIONS[type] || "";
};

export const getTypesAccesoire = (type) => {
  return TYPES_ACCESOIRE[type];
};
