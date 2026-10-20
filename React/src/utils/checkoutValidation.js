// Utilitaires de validation et calcul pour le checkout
export const validateLivraisonInfo = (livraisonInfo) => {
  const { nom, prenom, email, telephone, adresse, code_postal } = livraisonInfo;
  // Validation nom/prénom
  if (!nom || nom.trim().length === 0) {
    return { isValid: false, error: "Le nom est obligatoire" };
  }
  //   Validation prénom
  if (!prenom || prenom.trim().length === 0) {
    return { isValid: false, error: "Le prénom est obligatoire" };
  }
  // Validation email
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: "L'email est obligatoire" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Format d'email invalide" };
  }
  // Validation téléphone
  if (!telephone || telephone.trim().length === 0) {
    return { isValid: false, error: "Le téléphone est obligatoire" };
  }
  //   Validation format téléphone
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  if (!phoneRegex.test(telephone.replace(/\s/g, ""))) {
    return {
      isValid: false,
      error: "Format de téléphone invalide (ex: 06 12 34 56 78)",
    };
  }
  // Validation adresse
  if (!adresse || adresse.trim().length === 0) {
    return { isValid: false, error: "L'adresse est obligatoire" };
  }
  //   Validation longueur adresse
  if (adresse.trim().length < 5) {
    return {
      isValid: false,
      error: "L'adresse doit contenir au moins 5 caractères",
    };
  }
  // Validation code postal
  if (!code_postal || code_postal.trim().length === 0) {
    return { isValid: false, error: "Le code postal est obligatoire" };
  }
  // Validation format code postal
  const codePostalRegex = /^[0-9]{5}$/;
  if (!codePostalRegex.test(code_postal)) {
    return {
      isValid: false,
      error: "Code postal invalide (5 chiffres requis)",
    };
  }

  return { isValid: true, error: null };
};
// Calcule le total et le nombre d'articles dans le checkout
export const calculateCheckoutTotals = (lignesCommande) => {
  // Vérification du tableau de lignes de commande
  if (!Array.isArray(lignesCommande)) {
    return { total: 0, nombreArticles: 0 };
  }

  let total = 0;
  let nombreArticles = 0;
  // Parcours des lignes de commande
  lignesCommande.forEach((ligne) => {
    if (!ligne) return;
    // Comptage des articles
    nombreArticles += ligne.quantite || 0;
    // Voiture (acompte 10%)
    if (ligne.type_produit === true && ligne.voiture) {
      total += ligne.acompte || 0;
    }
    // Accessoire
    else if (ligne.accesoire) {
      // Calcul du prix total accessoire
      const prixUnitaire = ligne.accesoire.prix || 0;
      const quantite = ligne.quantite || 0;
      total += prixUnitaire * quantite;
    }
  });

  return { total, nombreArticles };
};
// Formate le nom d'une ligne de commande
export const formatLigneCommandeNom = (ligne) => {
  // Vérification de la ligne
  if (!ligne) return "Article inconnu";
  // ligne de voiture
  if (ligne.type_produit === true && ligne.voiture) {
    // Formater le nom du modèle Porsche
    let nom = `Porsche ${ligne.voiture.nom_model || ""}`.trim();
    // Ajouter la variante si disponible
    if (ligne.voiture.variante) {
      // Ajouter un espace avant la variante
      nom += ` ${ligne.voiture.variante}`;
    }
    return nom || "Porsche";
  }
  // Accessoire
  if (ligne.accesoire) {
    // Retourner le nom de l'accessoire
    return ligne.accesoire.nom_accesoire || "Accessoire";
  }
  return "Article";
};
// Calcule le prix total d'une ligne de commande
export const calculateLignePrix = (ligne) => {
  if (!ligne) return 0;
  const quantite = ligne.quantite || 0;
  // Voiture (acompte)
  if (ligne.type_produit === true && ligne.voiture) {
    return ligne.acompte || 0;
  }
  // Accessoire
  if (ligne.accesoire) {
    const prixUnitaire = ligne.accesoire.prix || 0;
    return prixUnitaire * quantite;
  }
  return 0;
};
// Prépare les informations initiales de livraison à partir de l'utilisateur
export const prepareInitialLivraisonInfo = (user) => {
  // Si pas d'utilisateur, retourner des champs vides
  if (!user) {
    return {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      adresse: "",
      code_postal: "",
    };
  }

  return {
    nom: user.nom || "",
    prenom: user.prenom || "",
    email: user.email || "",
    telephone: user.telephone || "",
    adresse: user.adresse || "",
    code_postal: user.code_postal || "",
  };
};
