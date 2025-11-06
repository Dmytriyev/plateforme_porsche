// Tailles de jantes disponibles (en pouces)
export const TAILLES_JANTE = ["16", "17", "18", "19", "21", "22", "23"];
// Couleurs de jantes disponibles
export const COULEURS_JANTE = ["black", "gray", "red", "white"];
// vérifier si une taille est valide
export const isValidTailleJante = (taille) => {
  return TAILLES_JANTE.includes(taille);
};
//  vérifier si une couleur est valide
export const isValidCouleurJante = (couleur) => {
  return COULEURS_JANTE.includes(couleur);
};

//  obtenir les tailles disponibles
export const getAvailableTailles = () => {
  return TAILLES_JANTE.map((taille) => ({
    value: taille,
    label: `${taille}"`,
  }));
};

//  obtenir les couleurs disponibles
export const getAvailableCouleurs = () => {
  return COULEURS_JANTE.map((couleur) => ({
    value: couleur,
    label: couleur.charAt(0).toUpperCase() + couleur.slice(1),
  }));
};

// Fonction pour obtenir toutes les options
export const getJanteOptions = () => {
  return {
    tailles: getAvailableTailles(),
    couleurs: getAvailableCouleurs(),
  };
};
