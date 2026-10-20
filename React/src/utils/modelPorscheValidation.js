// Validation du formulaire d'ajout de modèle Porsche
export const validateModelPorscheForm = (formData) => {
  const errors = {};
  // Champs obligatoires
  if (!formData.voiture) {
    errors.voiture = "Le modèle de base est requis";
  }
  // Nom du modèle requis
  if (!formData.nom_model?.trim()) {
    errors.nom_model = "La variante est requise";
  }
  // Type de carrosserie requis
  if (!formData.prix_base) {
    errors.prix_base = "Le prix est requis";
  } else {
    // Validation du prix
    const prix = parseFloat(formData.prix_base);
    // Le prix doit être un nombre positif
    if (isNaN(prix) || prix <= 0) {
      errors.prix_base = "Le prix doit être supérieur à 0";
    }
  }
  // Spécifications techniques requises
  if (!formData.moteur?.trim()) {
    errors.moteur = "Le moteur est requis";
  }
  // Puissance requise
  if (!formData.puissance) {
    errors.puissance = "La puissance est requise";
  } else {
    // Validation de la puissance
    const puissance = parseFloat(formData.puissance);
    // La puissance doit être un nombre positif
    if (isNaN(puissance) || puissance <= 0) {
      errors.puissance = "La puissance doit être supérieure à 0";
    }
  }
  // Transmission requise
  if (!formData.transmission) {
    errors.transmission = "La transmission est requise";
  }
  // Accélération requise
  if (!formData.acceleration_0_100) {
    errors.acceleration_0_100 = "L'accélération est requise";
  } else {
    // Validation de l'accélération
    const accel = parseFloat(formData.acceleration_0_100);
    if (isNaN(accel) || accel <= 0) {
      errors.acceleration_0_100 = "L'accélération doit être supérieure à 0";
    }
  }
  // Vitesse max requise
  if (!formData.vitesse_max) {
    errors.vitesse_max = "La vitesse max est requise";
  } else {
    // Validation de la vitesse max
    const vitesse = parseFloat(formData.vitesse_max);
    if (isNaN(vitesse) || vitesse <= 0) {
      errors.vitesse_max = "La vitesse doit être supérieure à 0";
    }
  }
  // Consommation requise
  if (!formData.consommation) {
    // Validation de la consommation
    errors.consommation = "La consommation est requise";
  } else {
    const conso = parseFloat(formData.consommation);
    // La consommation doit être un nombre positif
    if (isNaN(conso) || conso <= 0) {
      errors.consommation = "La consommation doit être supérieure à 0";
    }
  }
  return {
    // Indique si le formulaire est valide (pas d'erreurs)
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
// Préparation des données modèle Porsche avant envoi API
export const prepareModelPorscheData = (formData, nouvelleVoitureId) => {
  const data = {
    // Champs obligatoires
    voiture: nouvelleVoitureId,
    nom_model: formData.nom_model.trim(),
    type_carrosserie: formData.type_carrosserie || undefined,
    prix_base: parseFloat(formData.prix_base),
    description: formData.description?.trim() || undefined,
    numero_vin: formData.numero_vin?.trim() || undefined,
    concessionnaire: formData.concessionnaire?.trim() || undefined,
    couleur_exterieur: formData.couleur_exterieur || undefined,
    couleur_interieur: formData.couleur_interieur || undefined,
    taille_jante: formData.taille_jante || undefined,
    siege: formData.siege || undefined,
    package: formData.package.length > 0 ? formData.package : undefined,
  };

  // Construire l'objet specifications
  const specifications = {
    moteur: formData.moteur.trim(),
    puissance: parseFloat(formData.puissance),
    transmission: formData.transmission,
    acceleration_0_100: parseFloat(formData.acceleration_0_100),
    vitesse_max: parseFloat(formData.vitesse_max),
    consommation: parseFloat(formData.consommation),
  };

  // Champs optionnels
  if (formData.couple) {
    specifications.couple = parseFloat(formData.couple);
  }
  // Ajouter specifications seulement s'il y a des données
  data.specifications = specifications;

  return data;
};
