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

// la liste des couleurs extérieures disponibles
export const getAvailableCouleursExterieur = () => {
  return COULEURS_EXTERIEUR.map((couleur) => ({
    value: couleur,
    label: couleur.charAt(0).toUpperCase() + couleur.slice(1),
  }));
};
