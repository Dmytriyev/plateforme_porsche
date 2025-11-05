import Voiture from "../models/voiture.model.js";
import Accesoire from "../models/accesoire.model.js";
/**
 * Calcule le prix et l'acompte pour une ligne de commande.
 *
 * - Si `body.type_produit === true` et `body.model_porsche_id` présent - c'est une voiture neuve configurée.
 *   - On récupère le model_porsche via `Model_porsche.findById`.
 *   - Calcul du prix total (voiture + options : couleurs, jantes)
 *   - acompte = body.acompte si fourni, sinon 20% du prixTotal par défaut
 *   - erreur si acompte > prixTotal
 * - Si `body.type_produit === true` et `body.voiture` présent (sans model_porsche_id) :
 *   - Voiture d'occasion : renvoie erreur (réservation uniquement)
 * - Si `body.type_produit === false` et `body.accesoire` présent - c'est un accessoire.
 *   - On récupère l'accessoire via `Accesoire.findById`.
 *   - prixUnitaire = accesoire.prix (fallback 0)
 *   - acompte = 0 (aucun acompte pour les accessoires)
 * Retour : { prix, acompte, error }
 * - `prix` : valeur à utiliser comme prix total
 * - `acompte` : acompte à conserver/afficher
 * - `error` : null si OK, sinon message d'erreur
 */
export const calculerPrixEtAcompte = async (body) => {
  let prixTotal = 0;
  let acompte = 0;

  // Cas : voiture neuve avec configuration Model_porsche
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
      return { error: "Configuration Porsche introuvable" };
    }

    // Vérifier que c'est bien une voiture neuve
    if (modelPorsche.voiture?.type_voiture !== true) {
      return {
        error:
          "Seules les voitures neuves peuvent être commandées avec une configuration",
      };
    }

    // Calculer prix total (prix_base de la VARIANTE + options)
    const prixBase = modelPorsche.prix_base || 0;
    const prixCouleurExt = modelPorsche.couleur_exterieur?.prix || 0;
    const prixCouleursInt = Array.isArray(modelPorsche.couleur_interieur)
      ? modelPorsche.couleur_interieur.reduce(
          (sum, c) => sum + (c.prix || 0),
          0
        )
      : 0;
    const prixJante = modelPorsche.taille_jante?.prix || 0;
    const prixPackage = modelPorsche.package?.prix || 0;
    const prixSiege = modelPorsche.siege?.prix || 0;

    prixTotal =
      prixBase +
      prixCouleurExt +
      prixCouleursInt +
      prixJante +
      prixPackage +
      prixSiege;

    // Calculer acompte
    // Voiture neuve: 20% du prix total par défaut
    // Voiture d'occasion: acompte spécifique ou 0 (peut être réservée)
    const pourcentageAcompte =
      modelPorsche.voiture?.type_voiture === true ? 0.2 : 0;
    acompte =
      body.acompte !== undefined
        ? body.acompte
        : prixTotal * pourcentageAcompte;

    // Vérification: l'acompte ne peut pas être supérieur au prix total
    if (acompte > prixTotal) {
      return { error: "L'acompte ne peut pas être supérieur au prix total" };
    }

    // Stocker aussi l'ID de la voiture pour compatibilité
    body.voiture = modelPorsche.voiture._id;
  }
  // Cas : voiture sans model_porsche_id (ancien système - déprécié)
  else if (body.type_produit === true && body.voiture) {
    return {
      error:
        "ID de configuration (model_porsche_id) requis pour commander une voiture. Toutes les voitures (neuves et occasions) doivent avoir une configuration MODEL_PORSCHE.",
    };
  }
  // Cas : voiture mais ni model_porsche_id ni voiture
  else if (body.type_produit === true) {
    return {
      error:
        "ID de configuration (model_porsche_id) requis pour commander une voiture neuve",
    };
  }
  // Cas : accessoire
  else if (body.type_produit === false && body.accesoire) {
    const accesoire = await Accesoire.findById(body.accesoire);
    if (!accesoire) {
      return { error: "Accessoire introuvable" };
    }
    prixTotal = accesoire.prix || 0;
    // Aucun acompte pour les accessoires
    acompte = 0;
  }

  return {
    prix: body.prix || prixTotal,
    acompte,
    error: null,
  };
};

/**
 * Vérification d'acces a la commande.
 * - on utilise `populate("commande")` pour charger la `commande` et accéder à `commande.commande.user`.
 * - Retourne true si l'utilisateur est propriétaire de la commande (même id) ou s'il est administrateur.
 */
export const peutAccederLigne = async (ligne, userId, isAdmin) => {
  const commande = await ligne.populate("commande");
  return commande.commande.user.toString() === userId || isAdmin;
};
