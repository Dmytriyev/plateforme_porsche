// Utilitaires pour la gestion des voitures
export const formatDateImmat = (date) => {
  // Formatte la date d'immatriculation au format MM/YYYY
  if (!date) return null;
  // Date invalide vérification
  try {
    // Création de l'objet Date
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    // Retour au format français MM/YYYY
    return d.toLocaleDateString("fr-FR", {
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    return null;
  }
};
// Formattage de la puissance moteur
export const formatPower = (infoMoteur) => {
  // Vérification de la validité de l'information moteur
  if (!infoMoteur || infoMoteur === "N/A") return null;
  return infoMoteur;
};
// Extraction de la photo principale
export const getPhotoPrincipale = (photos) => {
  // Vérification du tableau de photos
  if (!Array.isArray(photos) || photos.length === 0) {
    return null;
  }
  // Filtrage des photos valides
  const photosValides = photos.filter((p) => p && (p.name || p._id));
  return photosValides.length > 0 ? photosValides[0] : null;
};
// Extraction des thumbnails
export const getThumbnails = (photos, maxThumbnails = 3) => {
  // Vérification du tableau de photos
  if (!Array.isArray(photos) || photos.length <= 1) {
    return [];
  }
  // Filtrage des photos valides
  const photosValides = photos.filter((p) => p && (p.name || p._id));
  return photosValides.slice(1, 1 + maxThumbnails);
};
// Récupération des photos d'une voiture
export const getPhotosVoiture = (voiture) => {
  // Vérification de l'objet voiture
  if (!voiture?.photo_voiture_actuel) {
    return [];
  }
  // Vérification du tableau de photos
  if (!Array.isArray(voiture.photo_voiture_actuel)) {
    return [];
  }
  // Filtrage des photos valides
  return voiture.photo_voiture_actuel.filter((p) => p && (p.name || p._id));
};
// Récupération de la lettre initiale du modèle
export const getInitialLetter = (typeModel) => {
  // Vérification de la validité du modèle
  if (!typeModel || typeof typeModel !== "string") {
    return "P";
  }
  return typeModel.charAt(0).toUpperCase();
};
// Validation de l'objet voiture
export const isVoitureValide = (voiture) => {
  return !!(voiture && voiture._id && voiture.type_model);
};
// Message de confirmation pour la suppression
export const getDeleteConfirmationMessage = (voiture) => {
  const model = voiture?.type_model || "cette voiture";
  return `Êtes-vous sûr de vouloir supprimer ${model} de votre liste ?`;
};
