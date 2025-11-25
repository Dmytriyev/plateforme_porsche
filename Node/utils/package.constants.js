/**
 * Constantes Package
 * - Types de packages/options disponibles et helper pour les récupérer
 * - Utilisé dans le configurateur pour proposer des bundles d'options
 */
// les types de packages prédéfinis disponibles dans le configurateur Porsche.
export const TYPES_PACKAGE = ["Weissach", "Sport Chrono"];
// la liste des types de packages disponibles
export const getAvailablePackages = () => {
  return TYPES_PACKAGE.map((pkg) => ({
    value: pkg,
    label: pkg,
  }));
};
