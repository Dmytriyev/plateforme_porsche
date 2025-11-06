// Liste des couleurs extérieures disponibles
export const COULEURS_EXTERIEUR = [
  "white",
  "black",
  "red",
  "bleu",
  "green",
  "yellow",
  "gray",
];

export const DEFAULT_COULEUR_EXTERIEUR = COULEURS_EXTERIEUR[0];
export const isValidCouleurExterieur = (couleur) => {
  return COULEURS_EXTERIEUR.includes(couleur);
};
// la liste des couleurs extérieures disponibles
export const getAvailableCouleursExterieur = () => {
  return COULEURS_EXTERIEUR.map((couleur) => ({
    value: couleur,
    label: couleur.charAt(0).toUpperCase() + couleur.slice(1),
  }));
};
// Descriptions détaillées
export const COULEUR_EXTERIEUR_DESCRIPTIONS = {
  black: "Noir profond - élégance classique Porsche",
  red: "Rouge Carmin - passion sportive",
  white: "Blanc pur - raffinement contemporain",
  bleu: "Bleu Gentiane - tradition racing",
  green: "Vert British Racing - héritage compétition",
  yellow: "Jaune Racing - audace et performance",
  gray: "Gris Agate - sophistication moderne",
};
export const getCouleurExterieurDescription = (couleur) => {
  return COULEUR_EXTERIEUR_DESCRIPTIONS[couleur] || "";
};
