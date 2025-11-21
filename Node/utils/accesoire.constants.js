/**
 * Constantes pour les accessoires
 * Définit les types d'accessoires et leurs descriptions
 */

// Types d'accessoires disponibles
export const TYPES_ACCESOIRE = [
  "porte-clés",
  "vetement",
  "decoration",
  "life-style",
];

export const DEFAULT_TYPE_ACCESOIRE = TYPES_ACCESOIRE[0];

/**
 * Vérifie si un type d'accessoire est valide
 */
export const isValidTypeAccesoire = (type) => {
  return TYPES_ACCESOIRE.includes(type);
};

/**
 * Retourne les types d'accessoires au format {value, label}
 */
export const getAvailableTypesAccesoire = () => {
  return TYPES_ACCESOIRE.map((type) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
  }));
};

// Descriptions des types d'accessoires
export const TYPE_ACCESOIRE_DESCRIPTIONS = {
  "porte-clés": "Porte-clés aux couleurs Porsche",
  vetement: "Vêtements et textiles collection Porsche",
  decoration: "Objets décoratifs et miniatures de collection",
  "life-style": "Articles lifestyle et accessoires du quotidien",
};

/**
 * Récupère la description d'un type d'accessoire
 */
export const getTypeAccesoireDescription = (type) => {
  return TYPE_ACCESOIRE_DESCRIPTIONS[type] || "";
};
