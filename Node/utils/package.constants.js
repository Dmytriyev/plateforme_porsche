// les types de packages prédéfinis disponibles dans le configurateur Porsche.
export const TYPES_PACKAGE = ["Weissach", "Sport Chrono"];
// la liste des types de packages disponibles
export const getAvailablePackages = () => {
  return TYPES_PACKAGE.map((pkg) => ({
    value: pkg,
    label: pkg,
  }));
};
