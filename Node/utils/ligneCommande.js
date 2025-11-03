import Voiture from "../models/voiture.model.js";
import Accesoire from "../models/accesoire.model.js";

/**
 * Calcule le prix et l'acompte pour une ligne de commande
 * @param {Object} body - Données de la ligne
 * @returns {Object} {prix, acompte, error}
 */
export const calculerPrixEtAcompte = async (body) => {
  let prixUnitaire = 0;
  let acompte = 0;

  // Voiture neuve
  if (body.type_produit === true && body.voiture) {
    const voiture = await Voiture.findById(body.voiture);
    if (!voiture) {
      return { error: "Voiture introuvable" };
    }

    if (voiture.type_voiture === true) {
      // Voiture neuf
      prixUnitaire = voiture.prix || 0;
      acompte = body.acompte || prixUnitaire * 0.2; // 20% par défaut

      if (acompte > prixUnitaire) {
        return { error: "L'acompte ne peut pas être supérieur au prix total" };
      }
    } else {
      // Voiture d'occasion - uniquement en réservation
      return {
        error:
          "Les voitures d'occasion ne peuvent pas être commandées. Veuillez faire une réservation.",
      };
    }
  }
  // Accessoire
  else if (body.type_produit === false && body.accesoire) {
    const accesoire = await Accesoire.findById(body.accesoire);
    if (!accesoire) {
      return { error: "Accessoire introuvable" };
    }
    prixUnitaire = accesoire.prix || 0;
    acompte = 0;
  }

  return {
    prix: body.prix || prixUnitaire,
    acompte,
    error: null,
  };
};

/**
 * Vérifie si l'utilisateur peut accéder à une ligne de commande
 * @param {Object} ligne - Ligne de commande
 * @param {String} userId - ID de l'utilisateur
 * @param {Boolean} isAdmin - Est admin
 * @returns {Boolean}
 */
export const peutAccederLigne = async (ligne, userId, isAdmin) => {
  const commande = await ligne.populate("commande");
  return commande.commande.user.toString() === userId || isAdmin;
};
