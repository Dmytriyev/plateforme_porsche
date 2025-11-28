// Validation du formulaire de voiture
export const validateVoitureForm = (formData) => {
  const errors = {};
  // Champs requis
  if (!formData.type_model?.trim()) {
    errors.type_model = "Le modèle est requis";
  }
  // Champs obligatoires
  if (!formData.annee_production) {
    errors.annee_production = "L'année de production est requise";
  }
  // Validation prix base (optionnel mais doit être valide si fourni)
  if (formData.prix_base) {
    // Vérifier que le prix est un nombre positif
    const prix = parseFloat(formData.prix_base);
    if (isNaN(prix) || prix < 0) {
      // Ajouter une erreur si le prix n'est pas valide
      errors.prix_base = "Le prix doit être un nombre positif";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
// Préparation des données voiture avant envoi API
export const prepareVoitureData = (formData) => {
  const data = {
    // Champs obligatoires
    type_model: formData.type_model.trim(),
    annee_production: formData.annee_production,
    couleur_exterieur: formData.couleur_exterieur || undefined,
    couleur_interieur: formData.couleur_interieur || undefined,
    taille_jante: formData.taille_jante || undefined,
    siege: formData.siege || undefined,
    info_moteur: formData.info_moteur || undefined,
    info_transmission: formData.info_transmission || undefined,
    type_carrosserie: formData.type_carrosserie || undefined,
    package_weissach: formData.package_weissach,
    sport_chrono: formData.sport_chrono,
  };

  // Construire l'objet specifications
  const specifications = {};
  //   Ajouter les spécifications seulement si fournies
  if (formData.puissance) specifications.puissance = formData.puissance.trim();
  if (formData.couple) specifications.couple = formData.couple.trim();
  if (formData.acceleration)
    specifications.acceleration = formData.acceleration.trim();
  if (formData.vitesse_max)
    specifications.vitesse_max = formData.vitesse_max.trim();
  if (formData.consommation)
    specifications.consommation = formData.consommation.trim();

  // Ajouter specifications seulement s'il y a des données
  if (Object.keys(specifications).length > 0) {
    data.specifications = specifications;
  }

  // Ajouter prix_base_variante si fourni
  if (formData.prix_base) {
    data.prix_base_variante = parseFloat(formData.prix_base);
  }

  return data;
};
