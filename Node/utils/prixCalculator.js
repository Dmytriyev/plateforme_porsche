import Model_porsche from "../models/model_porsche.model.js";

/**
 * Calcule le prix total d'un model_porsche avec toutes ses options
 * @param {String} voitureId - ID de la voiture
 * @returns {Object|null} Détails du prix ou null si non trouvé
 */
export const calculerPrixTotalModelPorsche = async (voitureId) => {
  try {
    const modelPorsche = await Model_porsche.findOne({ voiture: voitureId })
      .populate("voiture", "prix")
      .populate("couleur_exterieur", "prix")
      .populate("couleur_interieur", "prix")
      .populate("taille_jante", "prix");

    if (!modelPorsche) return null;

    const prixBase = modelPorsche.voiture?.prix || 0;
    const prixCouleurExt = modelPorsche.couleur_exterieur?.prix || 0;
    const prixCouleursInt =
      modelPorsche.couleur_interieur?.reduce(
        (sum, couleur) => sum + (couleur.prix || 0),
        0
      ) || 0;
    const prixJante = modelPorsche.taille_jante?.prix || 0;
    const totalOptions = prixCouleurExt + prixCouleursInt + prixJante;

    return {
      model_porsche_id: modelPorsche._id,
      prix_base: prixBase,
      options: {
        couleur_exterieur: prixCouleurExt,
        couleurs_interieur: prixCouleursInt,
        taille_jante: prixJante,
      },
      total_options: totalOptions,
      prix_total_avec_options: prixBase + totalOptions,
    };
  } catch (error) {
    console.error("Erreur calcul prix model_porsche:", error);
    return null;
  }
};

/**
 * Enrichit une ligne de commande avec les détails du model_porsche si c'est une voiture
 * @param {Object} ligne - Ligne de commande
 * @returns {Object} Ligne enrichie
 */
export const enrichirLigneAvecModelPorsche = async (ligne) => {
  const ligneObj = ligne.toObject ? ligne.toObject() : ligne;

  if (ligneObj.type_produit && ligneObj.voiture?._id) {
    const prixDetails = await calculerPrixTotalModelPorsche(
      ligneObj.voiture._id
    );
    if (prixDetails) {
      ligneObj.model_porsche_details = prixDetails;
    }
  }

  return ligneObj;
};

/**
 * Calcule le montant à payer pour une ligne (acompte pour voiture, prix pour accessoire)
 * @param {Object} ligne - Ligne de commande
 * @returns {Number} Montant à payer
 */
export const calculerMontantLigne = (ligne) => {
  const montant =
    ligne.type_produit && ligne.acompte > 0 ? ligne.acompte : ligne.prix;
  return montant * ligne.quantite;
};
