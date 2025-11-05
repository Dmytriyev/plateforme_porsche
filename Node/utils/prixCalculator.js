import Model_porsche from "../models/model_porsche.model.js";
/**
 * Calcule le prix total d'un `model_porsche` avec ses options (couleur ext/int, jantes).
 * Entrée:
 * - modelPorscheId (String) : identifiant du model_porsche configuré
 * Sortie (en cas de succès)- objet contenant:
 * - model_porsche_id : _id du document model_porsche
 * - prix_base : prix de la voiture elle-même (champ `prix` dans la collection voiture)
 * - options : objet listant le prix de chaque option (couleur ext/int, jantes)
 * - total_options : somme des prix des options
 * - prix_total_avec_options : prix_base + total_options
 * - gère les cas où une option peut être absente (fallback à 0)
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

    if (!modelPorsche) return null;

    // Prix de base de la VARIANTE (ex: 911 Carrera = 120k€, 911 GTS = 150k€)
    const prixBase = modelPorsche.prix_base || 0;
    const prixCouleurExt = modelPorsche.couleur_exterieur?.prix || 0;
    // La couleur intérieure peut être un tableau : on additionne les prix.
    // Si couleur_interieur est absent ou vide, on obtient 0.
    const prixCouleursInt =
      modelPorsche.couleur_interieur?.reduce(
        (sum, couleur) => sum + (couleur.prix || 0),
        0
      ) || 0;

    const prixJante = modelPorsche.taille_jante?.prix || 0;
    const prixPackage = modelPorsche.package?.prix || 0;
    const prixSiege = modelPorsche.siege?.prix || 0;

    // Somme des options
    const totalOptions =
      prixCouleurExt + prixCouleursInt + prixJante + prixPackage + prixSiege;
    const prixTotal = prixBase + totalOptions;
    const acompte = prixTotal * 0.2; // Acompte de 20%

    return {
      model_porsche_id: modelPorsche._id,
      nom_model: modelPorsche.nom_model,
      gamme: modelPorsche.voiture?.nom_model,
      prix_base_variante: prixBase,
      options: {
        couleur_exterieur: prixCouleurExt,
        couleurs_interieur: prixCouleursInt,
        taille_jante: prixJante,
        package: prixPackage,
        siege: prixSiege,
      },
      total_options: totalOptions,
      prix_total_avec_options: prixTotal,
      acompte_requis: acompte,
    };
  } catch (error) {
    console.error("Erreur calcul prix model_porsche:", error);
    return null;
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
    // Récupère les détails de prix (prix de base + options)
    const prixDetails = await calculerPrixTotalModelPorsche(
      ligneObj.model_porsche_id
    );
    if (prixDetails) {
      ligneObj.model_porsche_details = prixDetails;
    }
  }

  return ligneObj;
};

/**
 * Calcule le montant à payer pour une ligne de commande.
 * - si `ligne.type_produit` est exact (voiture) ET `ligne.acompte > 0`,
 *   on prend l'acompte comme montant à payer;
 * - sinon on prend `ligne.prix` (prix l'accessoire).
 * - le montant final est multiplié par `ligne.quantite`.
 */
export const calculerMontantLigne = (ligne) => {
  const montant =
    ligne.type_produit && ligne.acompte > 0 ? ligne.acompte : ligne.prix;
  return montant * ligne.quantite;
};
