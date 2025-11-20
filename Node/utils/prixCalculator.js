import Model_porsche from "../models/model_porsche.model.js";
/**
 * Calcule le prix total d'un `model_porsche` avec ses options (couleur ext/int, jantes).
 * - modelPorscheId (String) : identifiant du model_porsche configuré
 * - model_porsche_id : _id du document model_porsche
 * - prix_base : prix de la voiture elle-même (champ `prix` dans la collection voiture)
 * - options : objet listant le prix de chaque option (couleur ext/int, jantes)
 * - total_options : somme des prix des options
 * - prix_total_avec_options : prix_base + total_options
 */
export const calculerPrixTotalModelPorsche = async (modelPorscheId) => {
  try {
    // Récupère le document model_porsche par son ID directement
    const modelPorsche = await Model_porsche.findById(modelPorscheId)
      .populate("voiture", "nom_model type_voiture")
      .populate("couleur_exterieur", "prix nom_couleur")
      .populate("couleur_interieur", "prix nom_couleur")
      .populate("taille_jante", "prix taille_jante")
      .populate("package", "prix nom_package")
      .populate("siege", "prix nom_siege");

    if (!modelPorsche)
      throw new Error(`model_porsche introuvable pour l'id ${modelPorscheId}`);

    // Calcul des prix de base
    const prixBase = Number(modelPorsche.prix_base) || 0;
    const prixCouleurExterieur =
      Number(modelPorsche.couleur_exterieur?.prix) || 0;

    // couleur_interieur peut être un tableau, un objet ou undefined.
    let prixCouleursInterieur = 0;
    const couleursInterieur = modelPorsche.couleur_interieur;
    if (Array.isArray(couleursInterieur)) {
      prixCouleursInterieur =
        // Somme des prix des couleurs d'intérieur si c'est un tableau
        couleursInterieur.reduce(
          (sum, couleur) => sum + (Number(couleur?.prix) || 0),
          0
        ) || 0;
    } else if (couleursInterieur && typeof couleursInterieur === "object") {
      prixCouleursInterieur = Number(couleursInterieur.prix) || 0;
    }

    const prixJante = Number(modelPorsche.taille_jante?.prix) || 0;
    const prixPackage = Number(modelPorsche.package?.prix) || 0;
    const prixSiege = Number(modelPorsche.siege?.prix) || 0;

    // Somme des options
    const totalOptions =
      prixCouleurExterieur +
      prixCouleursInterieur +
      prixJante +
      prixPackage +
      prixSiege;
    const prixTotal = prixBase + totalOptions;
    const acompte = prixTotal * 0.1; // Acompte de 10%

    return {
      model_porsche_id: modelPorsche._id,
      nom_model: modelPorsche.nom_model,
      gamme: modelPorsche.voiture?.nom_model,
      prix_base_variante: prixBase,
      options: {
        couleur_exterieur: prixCouleurExterieur,
        couleurs_interieur: prixCouleursInterieur,
        taille_jante: prixJante,
        package: prixPackage,
        siege: prixSiege,
      },
      total_options: totalOptions,
      prix_total_avec_options: prixTotal,
      acompte_requis: acompte,
    };
  } catch (error) {
    // une erreur contrôlée et le message original pour le debug.
    const err = new Error(`Erreur calcul prix model_porsche: ${error.message}`);
    err.original = error;
    throw err;
  }
};
/**
 * - ligne peut être un document Mongoose (`toObject`) ou un simple objet.
 * - si la ligne contient `type_produit` et `model_porsche_id`, on récupérera
 *   les détails de prix via `calculerPrixTotalModelPorsche`.
 */
export const enrichirLigneAvecModelPorsche = async (ligne) => {
  // Si `ligne` est un document Mongoose, on créé un objet JS
  const ligneObj = ligne.toObject ? ligne.toObject() : ligne;
  // Vérifie que la ligne représente bien un produit de type voiture avec un model_porsche_id
  if (ligneObj.type_produit && ligneObj.model_porsche_id) {
    try {
      // Récupère les détails de prix (prix de base + options)
      const prixDetails = await calculerPrixTotalModelPorsche(
        ligneObj.model_porsche_id
      );
      ligneObj.model_porsche_details = prixDetails;
    } catch (error) {
      ligneObj.model_porsche_details = null;

      ligneObj.model_porsche_error = {
        message: error.message || "Erreur inconnue lors du calcul des prix",
        code: "CALCUL_PRIX_ERROR",
      };

      // Logger l'erreur via le logger centralisé
      try {
        const logger = (await import("./logger.js")).default;
        logger.error("enrichirLigneAvecModelPorsche - erreur:", error);
      } catch (e) {
        // si l'import échoue, fallback silencieux
      }
    }
  }

  return ligneObj;
};

/**
 * Calcule le montant à payer pour une ligne de commande.
 * - si `ligne.type_produit` est exact (voiture) ET `ligne.acompte > 0`,
 *   on prend l'acompte comme montant à payer;
 * - sinon on prend `ligne.prix` (prix l'accesoire).
 * - le montant final est multiplié par `ligne.quantite`.
 */
export const calculerMontantLigne = (ligne) => {
  const montant =
    ligne.type_produit && ligne.acompte > 0 ? ligne.acompte : ligne.prix;
  return montant * ligne.quantite;
};
