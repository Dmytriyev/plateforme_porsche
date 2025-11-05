import Commande from "../models/Commande.model.js";
import commandeValidation from "../validations/Commande.validation.js";
import LigneCommande from "../models/ligneCommande.model.js";
import {
  calculerPrixTotalModelPorsche,
  enrichirLigneAvecModelPorsche,
  calculerMontantLigne,
} from "../utils/prixCalculator.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendValidationError,
} from "../utils/responses.js";

const createCommande = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendError(res, "Pas de données dans la requête", 400);
    }

    body.user = req.user.id;

    const { error } = commandeValidation(body).CommandeCreate;
    if (error) return sendValidationError(res, error);

    const commande = await new Commande(body).save();
    const populatedCommande = await Commande.findById(commande._id).populate(
      "user",
      "nom prenom email"
    );

    return sendSuccess(
      res,
      populatedCommande,
      "Commande créée avec succès",
      201
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

const getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find()
      .populate("user", "nom prenom email")
      .sort({ date_commande: -1 });
    return sendSuccess(res, commandes);
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

const getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id).populate(
      "user",
      "nom prenom email"
    );
    if (!commande) return sendNotFound(res, "Commande");

    const ligneCommandes = await LigneCommande.find({
      commande: req.params.id,
    })
      .populate("accesoire", "prix nom_accesoire")
      .populate("voiture", "prix nom_model type_voiture");

    // Enrichir lignes avec détails model_porsche
    const lignesEnrichies = await Promise.all(
      ligneCommandes.map((line) => enrichirLigneAvecModelPorsche(line))
    );

    // Calculer total à payer
    const total = ligneCommandes.reduce(
      (sum, line) => sum + calculerMontantLigne(line),
      0
    );

    return sendSuccess(res, {
      ...commande.toObject(),
      ligneCommandes: lignesEnrichies,
      total,
      note: "Le total inclut les acomptes pour les voitures neuves.",
    });
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

const updateCommande = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendError(res, "Pas de données dans la requête", 400);
    }

    const { error } = commandeValidation(body).CommandeUpdate;
    if (error) return sendValidationError(res, error);

    const updatedCommande = await Commande.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    ).populate("user", "nom prenom email");

    if (!updatedCommande) return sendNotFound(res, "Commande");

    return sendSuccess(res, updatedCommande, "Commande mise à jour");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

const deleteCommande = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) return sendNotFound(res, "Commande");

    // Supprimer lignes et commande
    await LigneCommande.deleteMany({ commande: req.params.id });
    await Commande.findByIdAndDelete(req.params.id);

    return sendSuccess(
      res,
      null,
      "Commande et ses lignes supprimées avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

const getPanier = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    const panier = await Commande.findOne({
      user: req.user.id,
      status: false, // false = panier actif/non validé
    }).populate("user", "nom prenom email");

    if (!panier) return sendNotFound(res, "Panier");

    const ligneCommandes = await LigneCommande.find({
      commande: panier._id,
    })
      .populate("accesoire", "nom_accesoire prix")
      .populate("voiture", "nom_model prix type_voiture");

    // Enrichir lignes avec détails model_porsche
    const lignesEnrichies = await Promise.all(
      ligneCommandes.map((line) => enrichirLigneAvecModelPorsche(line))
    );

    // Calculer total
    const total = ligneCommandes.reduce(
      (sum, line) => sum + calculerMontantLigne(line),
      0
    );

    return sendSuccess(res, {
      ...panier.toObject(),
      ligneCommandes: lignesEnrichies,
      total,
      note: "Le total à payer inclut les acomptes pour les voitures neuves.",
    });
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

const getMyCommandes = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    const historique = await Commande.find({
      user: req.user.id,
      status: true, // true = commandes validées/payées
    }).sort({ date_commande: -1 });

    return sendSuccess(res, historique);
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

const getOrCreatePanier = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    let panier = await Commande.findOne({
      user: req.user.id,
      status: false, // false = panier actif/non validé
    })
      .populate("user", "nom prenom email")
      .populate({
        path: "lignesCommande",
        populate: [{ path: "voiture" }, { path: "accesoire" }],
      });

    // Créer panier si inexistant
    if (!panier) {
      const nouveauPanier = await new Commande({
        user: req.user.id,
        date_commande: new Date(),
        status: false, // false = panier actif
        prix: 0,
        acompte: 0,
      }).save();

      panier = await Commande.findById(nouveauPanier._id)
        .populate("user", "nom prenom email")
        .populate({
          path: "lignesCommande",
          populate: [{ path: "voiture" }, { path: "accesoire" }],
        });
    }

    // Calculer total
    const lignesCommande = panier.lignesCommande || [];
    const prixTotal = lignesCommande.reduce(
      (total, ligne) => total + calculerMontantLigne(ligne),
      0
    );

    return sendSuccess(res, {
      ...panier.toObject(),
      prixTotal,
      nombreArticles: lignesCommande.length,
    });
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

const validerPanier = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    const panier = await Commande.findOne({
      user: req.user.id,
      status: false, // false = panier actif
    }).populate({
      path: "lignesCommande",
      populate: [{ path: "voiture" }, { path: "accesoire" }],
    });

    if (!panier) return sendNotFound(res, "Panier");

    if (!panier.lignesCommande || panier.lignesCommande.length === 0) {
      return sendError(res, "Le panier est vide", 400);
    }

    // Calculer prix total
    const prixTotal = panier.lignesCommande.reduce(
      (total, ligne) => total + calculerMontantLigne(ligne),
      0
    );

    // Transformer en commande validée
    panier.status = true; // true = commande validée
    panier.prix = prixTotal;
    panier.date_commande = new Date();
    await panier.save();

    const commandeValidee = await Commande.findById(panier._id)
      .populate("user", "nom prenom email")
      .populate({
        path: "lignesCommande",
        populate: [{ path: "voiture" }, { path: "accesoire" }],
      });

    return sendSuccess(res, commandeValidee, "Commande validée avec succès");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

const ajouterConfigurationAuPanier = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    const { model_porsche_id, quantite = 1 } = req.body;

    if (!model_porsche_id) {
      return sendValidationError(res, {
        details: [{ message: "model_porsche_id requis" }],
      });
    }

    // Import dynamique pour éviter dépendance circulaire
    const Model_porsche = (await import("../models/model_porsche.model.js"))
      .default;
    const Voiture = (await import("../models/voiture.model.js")).default;

    // 1. Vérifier que le model_porsche existe
    const modelPorsche = await Model_porsche.findById(model_porsche_id)
      .populate("voiture", "prix nom_model type_voiture")
      .populate("couleur_exterieur", "prix nom_couleur")
      .populate("couleur_interieur", "prix nom_couleur")
      .populate("taille_jante", "prix taille_jante");

    if (!modelPorsche) {
      return sendNotFound(res, "Configuration Porsche");
    }

    // 2. Vérifier que c'est bien une voiture neuve
    if (modelPorsche.voiture.type_voiture !== true) {
      return sendError(
        res,
        "Seules les voitures neuves peuvent être ajoutées au panier. Les occasions utilisent le système de réservation.",
        400
      );
    }

    // 3. Calculer le prix total de la configuration
    const prixDetails = await calculerPrixTotalModelPorsche(modelPorsche);

    if (!prixDetails) {
      return sendError(
        res,
        "Impossible de calculer le prix de la configuration",
        500
      );
    }

    const prixTotal = prixDetails.prix_total_avec_options;

    // 4. Calculer l'acompte (20%)
    const acompte = Math.round(prixTotal * 0.2);

    // 5. Récupérer ou créer le panier
    let panier = await Commande.findOne({
      user: req.user.id,
      status: false,
    });

    if (!panier) {
      panier = await new Commande({
        user: req.user.id,
        date_commande: new Date(),
        status: false,
        prix: 0,
        acompte: 0,
      }).save();
    }

    // 6. Vérifier si cette configuration existe déjà dans le panier
    const ligneExistante = await LigneCommande.findOne({
      commande: panier._id,
      model_porsche_id: model_porsche_id,
    });

    if (ligneExistante) {
      // Incrémenter la quantité
      ligneExistante.quantite += quantite;
      await ligneExistante.save();
    } else {
      // Créer nouvelle ligne de commande
      const nouvelleLigne = await new LigneCommande({
        commande: panier._id,
        voiture: modelPorsche.voiture._id,
        model_porsche_id: model_porsche_id,
        quantite: quantite,
        prix: prixTotal,
        acompte: acompte,
        type_produit: true, // true = voiture neuve
      }).save();
    }

    // 7. Récupérer le panier mis à jour
    const panierMisAJour = await Commande.findById(panier._id).populate(
      "user",
      "nom prenom email"
    );

    const lignesCommande = await LigneCommande.find({
      commande: panier._id,
    })
      .populate("voiture", "nom_model prix type_voiture")
      .populate("accesoire", "nom_accesoire prix");

    // Enrichir avec détails model_porsche
    const lignesEnrichies = await Promise.all(
      lignesCommande.map((line) => enrichirLigneAvecModelPorsche(line))
    );

    // Calculer total à payer (somme des acomptes pour voitures, prix pour accessoires)
    const totalAPayer = lignesCommande.reduce((sum, line) => {
      return sum + (line.type_produit ? line.acompte : line.prix);
    }, 0);

    return sendSuccess(
      res,
      {
        ...panierMisAJour.toObject(),
        ligneCommandes: lignesEnrichies,
        total_a_payer: totalAPayer,
        message:
          "Configuration ajoutée au panier. Vous payerez un acompte de 20% maintenant.",
      },
      "Configuration ajoutée au panier avec succès",
      201
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

const supprimerLignePanier = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    const { ligne_id } = req.params;

    // Vérifier que la ligne existe et appartient au panier de l'utilisateur
    const ligne = await LigneCommande.findById(ligne_id).populate({
      path: "commande",
      match: { user: req.user.id, status: false },
    });

    if (!ligne || !ligne.commande) {
      return sendNotFound(res, "Ligne de commande dans votre panier");
    }

    await LigneCommande.findByIdAndDelete(ligne_id);

    return sendSuccess(res, null, "Article supprimé du panier");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

const modifierQuantitePanier = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    const { ligne_id } = req.params;
    const { quantite } = req.body;

    if (!quantite || quantite < 1) {
      return sendValidationError(res, {
        details: [{ message: "Quantité doit être >= 1" }],
      });
    }

    // Vérifier que la ligne existe et appartient au panier de l'utilisateur
    const ligne = await LigneCommande.findById(ligne_id).populate({
      path: "commande",
      match: { user: req.user.id, status: false },
    });

    if (!ligne || !ligne.commande) {
      return sendNotFound(res, "Ligne de commande dans votre panier");
    }

    ligne.quantite = quantite;
    await ligne.save();

    const ligneEnrichie = await enrichirLigneAvecModelPorsche(ligne);

    return sendSuccess(res, ligneEnrichie, "Quantité mise à jour");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

export {
  createCommande,
  getAllCommandes,
  getCommandeById,
  updateCommande,
  deleteCommande,
  getPanier,
  getMyCommandes,
  getOrCreatePanier,
  validerPanier,
  ajouterConfigurationAuPanier,
  supprimerLignePanier,
  modifierQuantitePanier,
};
