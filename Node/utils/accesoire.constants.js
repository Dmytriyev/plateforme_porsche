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
