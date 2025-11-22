// Définition des types de sièges disponibles.
export const TYPES_SIEGE = ["Sièges sport", "Sièges sport adaptatifs Plus"];

// Fonction pour obtenir les types de sièges disponibles au format valeur/étiquette
export const getAvailableSieges = () => {
  return TYPES_SIEGE.map((siege) => ({
    value: siege,
    label: siege,
  }));
};
