/**
 * Constantes Accessoires
 * - Liste des types d'accessoires disponibles dans le catalogue
 * - Utilisé par le configurateur et les API pour valider les types
 */
// Types d'accessoires disponibles
export const TYPES_ACCESOIRE = [
  "porte-clés",
  "vetement",
  "decoration",
  "life-style",
];

export const getAvailableTypesAccesoire = () => {
  return TYPES_ACCESOIRE.map((type) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
  }));
};
