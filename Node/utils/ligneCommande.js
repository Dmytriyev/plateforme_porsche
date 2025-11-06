/**
 * Calcule le prix et l'acompte pour une ligne de commande.
 * - Si `body.type_produit === true` et `body.model_porsche_id` présent - c'est une voiture neuve.
 *   - On récupère le model_porsche via `Model_porsche.findById`.
 *   - Calcul du prix total (voiture + options : couleurs, jantes)
 *   - acompte = body.acompte si fourni, sinon 10% du prixTotal par défaut
 *   - erreur si acompte > prixTotal
 * - Si `body.type_produit === true` et `body.voiture` présent (sans model_porsche_id) :
 *   - Voiture d'occasion : erreur (réservation uniquement)
 * - Si `body.type_produit === false` et `body.accesoire` présent - c'est un accessoire.
 *   - On récupère l'accessoire via `Accesoire.findById`.
 *   - prixUnitaire = accesoire.prix
 *   - acompte = 0 (aucun acompte pour les accessoires)
 * Retour : { prix, acompte, error }
 * - `prix` : valeur à utiliser comme prix total
 * - `acompte` : acompte à conserver/afficher
 * - `error` : null si OK, sinon message d'erreur
 */
import Voiture from "../models/voiture.model.js";
import Accesoire from "../models/accesoire.model.js";
export const calculerPrixEtAcompte = async (body) => {
  let prixTotal = 0;
  let acompte = 0;

  // voiture neuve avec configuration Model_porsche
  if (body.type_produit === true && body.model_porsche_id) {
    // Import dynamique pour éviter dépendances circulaires
    const Model_porsche = (await import("../models/model_porsche.model.js"))
      .default;

    const modelPorsche = await Model_porsche.findById(body.model_porsche_id)
      .populate("voiture", "nom_model type_voiture")
      .populate("couleur_exterieur", "prix")
      .populate("couleur_interieur", "prix")
      .populate("taille_jante", "prix")
      .populate("package", "prix")
      .populate("siege", "prix");

    if (!modelPorsche) {
      return {
        error: {
          message: "Configuration Porsche introuvable",
          code: "CONFIG_PORSCHE_NOT_FOUND",
        },
      };
    }
    // Vérifier que c'est bien une voiture neuve
    if (modelPorsche.voiture?.type_voiture !== true) {
      return {
        error:
          "Seules les voitures neuves peuvent être commandées avec une configuration",
      };
    }
    // Calculer prix total (prix_base + options)
    // Conversion en Number pour éviter NaN si les champs sont string
    const prixBase = Number(modelPorsche.prix_base) || 0;
    const prixCouleurExterieur =
      Number(modelPorsche.couleur_exterieur?.prix) || 0;

    // couleur_interieur peut être un tableau, un objet ou undefined.
    let prixCouleursInterieur = 0;
    const couleursInterieur = modelPorsche.couleur_interieur;
    if (Array.isArray(couleursInterieur)) {
      // Si plusieurs couleurs intérieures, on additionne leurs prix si non
      prixCouleursInterieur =
        couleursInterieur.reduce((sum, c) => sum + (Number(c?.prix) || 0), 0) ||
        0;
    } else if (couleursInterieur && typeof couleursInterieur === "object") {
      prixCouleursInterieur = Number(couleursInterieur.prix) || 0;
    }

    const prixJante = Number(modelPorsche.taille_jante?.prix) || 0;
    const prixPackage = Number(modelPorsche.package?.prix) || 0;
    const prixSiege = Number(modelPorsche.siege?.prix) || 0;
    prixTotal =
      prixBase +
      prixCouleurExterieur +
      prixCouleursInterieur +
      prixJante +
      prixPackage +
      prixSiege;

    // Voiture neuve: acompte 10% du prix total par défaut
    // Voiture d'occasion: acompte 0 (peut être que réservée)
    const pourcentageAcompte =
      modelPorsche.voiture?.type_voiture === true ? 0.1 : 0;
    acompte =
      body.acompte !== undefined
        ? body.acompte
        : prixTotal * pourcentageAcompte;

    if (acompte > prixTotal) {
      return {
        error: {
          message: "L'acompte ne peut pas être supérieur au prix total",
          code: "ACOMPTE_SUPERIEUR",
        },
      };
    }

    // Stocker aussi l'ID de la voiture pour compatibilité
    body.voiture = modelPorsche.voiture._id;
  }
  // voiture sans model_porsche_id
  else if (body.type_produit === true && body.voiture) {
    return {
      error: {
        message:
          "ID de configuration (model_porsche_id) requis pour commander une voiture.",
        code: "CONFIG_ID_REQUIRED",
      },
    };
  }
  // voiture ni model_porsche_id ni voiture
  else if (body.type_produit === true) {
    return {
      error: {
        message:
          "ID de configuration (model_porsche_id) requis pour commander une voiture neuve",
        code: "CONFIG_ID_REQUIRED",
      },
    };
  }
  // accessoire : Aucun acompte pour les accessoires
  else if (body.type_produit === false && body.accesoire) {
    const accesoire = await Accesoire.findById(body.accesoire);
    if (!accesoire) {
      return {
        error: {
          message: "Accessoire introuvable",
          code: "ACCESSOIRE_NOT_FOUND",
        },
      };
    }
    prixTotal = accesoire.prix || 0;
    acompte = 0;
  }

  return {
    prix: body.prix || prixTotal,
    acompte,
    error: null,
  };
};

//  populate (commande) pour accéder à commande.commande.user
export const peutAccederLigne = async (ligne, userId, isAdmin) => {
  const commande = await ligne.populate("commande");
  return commande.commande.user.toString() === userId || isAdmin;
};
