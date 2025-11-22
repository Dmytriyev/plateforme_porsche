// la liste des couleurs intérieures disponibles
export const COULEURS_INTERIEUR = ["black", "caramel", "red", "red/white"];
// la liste des couleurs intérieures disponibles
export const getAvailableCouleursInterieur = () => {
  return COULEURS_INTERIEUR.map((couleur) => ({
    value: couleur,
    label: couleur.charAt(0).toUpperCase() + couleur.slice(1),
  }));
};
