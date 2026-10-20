// Validation des données du formulaire d'accessoire
export const validateAccessoireForm = (formData) => {
  // Objet pour stocker les erreurs
  const errors = {};
  // Champs obligatoires
  if (!formData.nom_accesoire?.trim()) {
    errors.nom_accesoire = "Le nom est requis";
  }
  // Validation description
  if (!formData.description?.trim()) {
    errors.description = "La description est requise";
  }
  // Validation type accessoire
  if (!formData.type_accesoire) {
    errors.type_accesoire = "Le type est requis";
  }
  // Validation prix
  if (!formData.prix) {
    errors.prix = "Le prix est requis";
  }
  // Conversion en nombre flottant
  const prix = parseFloat(formData.prix);
  if (isNaN(prix) || prix <= 0) {
    errors.prix = "Le prix doit être supérieur à 0";
  }
  // Validation prix promotion
  if (formData.prix_promotion) {
    //   Conversion en nombre flottant
    const prixPromo = parseFloat(formData.prix_promotion);
    // Validation du prix promotionnel
    if (isNaN(prixPromo) || prixPromo <= 0) {
      errors.prix_promotion = "Le prix promotionnel doit être supérieur à 0";
    } else if (prixPromo >= prix) {
      errors.prix_promotion =
        "Le prix promotionnel doit être inférieur au prix normal";
    }
  }
  // Validation stock
  if (formData.stock) {
    //  Conversion en entier
    const stock = parseInt(formData.stock);
    if (isNaN(stock) || stock < 0) {
      errors.stock = "Le stock ne peut pas être négatif";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
// Préparation des données avant envoi API
export const prepareAccessoireData = (formData) => {
  // Données obligatoires
  const data = {
    nom_accesoire: formData.nom_accesoire.trim(),
    description: formData.description.trim(),
    type_accesoire: formData.type_accesoire,
    prix: parseFloat(formData.prix),
    stock: parseInt(formData.stock) || 0,
  };
  // Champs optionnels
  if (formData.prix_promotion) {
    data.prix_promotion = parseFloat(formData.prix_promotion);
  }
  // Couleur accessoire
  if (formData.couleur_accesoire) {
    data.couleur_accesoire = formData.couleur_accesoire;
  }

  return data;
};
