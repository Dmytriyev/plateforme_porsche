// les types de packages prédéfinis disponibles dans le configurateur Porsche.
export const TYPES_PACKAGE = ["Weissach", "Sport Chrono"];
export const DEFAULT_PACKAGE = TYPES_PACKAGE[0];
// Vérifie si un type de package est valide
export const isValidPackageType = (type) => {
  return TYPES_PACKAGE.includes(type);
};
// la liste des types de packages disponibles
export const getAvailablePackages = () => {
  return TYPES_PACKAGE.map((pkg) => ({
    value: pkg,
    label: pkg,
  }));
};
// Descriptions détaillées
export const PACKAGE_DESCRIPTIONS = {
  Weissach:
    "Package allégé pour performance maximale avec composants en carbone",
  "Sport Chrono":
    "Package performance avec chronomètre et modes de conduite sportifs",
};
export const getPackageDescription = (type) => {
  return PACKAGE_DESCRIPTIONS[type] || "";
};
