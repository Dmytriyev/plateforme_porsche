export const COULEURS_INTERIEUR = ["black", "caramel", "red", "red/white"];

export const DEFAULT_COULEUR_INTERIEUR = COULEURS_INTERIEUR[0];
export const isValidCouleurInterieur = (couleur) => {
  return COULEURS_INTERIEUR.includes(couleur);
};
// la liste des couleurs intérieures disponibles
export const getAvailableCouleursInterieur = () => {
  return COULEURS_INTERIEUR.map((couleur) => ({
    value: couleur,
    label: couleur.charAt(0).toUpperCase() + couleur.slice(1),
  }));
};
// Descriptions détaillées
export const COULEUR_INTERIEUR_DESCRIPTIONS = {
  black: "Cuir noir classique - élégance intemporelle",
  caramel: "Cuir caramel chaleureux - luxe raffiné",
  red: "Cuir rouge sportif - caractère affirmé",
  "red/white": "Cuir bicolore rouge et blanc - style racing",
};
export const getCouleurInterieurDescription = (couleur) => {
  return COULEUR_INTERIEUR_DESCRIPTIONS[couleur] || "";
};
