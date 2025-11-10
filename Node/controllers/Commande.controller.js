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

// Créer une nouvelle commande
const createCommande = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  // Vérifier la présence des données dans la requête
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendError(res, "Pas de données dans la requête", 400);
    }
    // Ajouter l'ID utilisateur depuis le token d'authentification
    body.user = req.user.id;
    // Valider les données de la commande
    const { error } = commandeValidation(body).CommandeCreate;
    if (error) return sendValidationError(res, error);

    // Créer et sauvegarder la nouvelle commande
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

// Récupérer toutes les commandes
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

// Récupérer une commande par ID
const getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id).populate(
      "user",
      "nom prenom email"
    );
    if (!commande) return sendNotFound(res, "Commande");

    // Récupérer les lignes de commande associées à cette commande
    const ligneCommandes = await LigneCommande.find({
      commande: req.params.id,
    })
      .populate("accesoire", "prix nom_accesoire")
      .populate("voiture", "prix nom_model type_voiture");

    //  détails model_porsche pour chaque ligne de commande
    const lignesEnrichies = await Promise.all(
      ligneCommandes.map((line) => enrichirLigneAvecModelPorsche(line))
    );

    // Calculer total à payer pour la commande
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

// Mettre à jour une commande par ID
const updateCommande = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendError(res, "Pas de données dans la requête", 400);
    }

    const { error } = commandeValidation(body).CommandeUpdate;
    if (error) return sendValidationError(res, error);

    // Mettre à jour la commande dans la base de données
    const updatedCommande = await Commande.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    ).populate("user", "nom prenom email");

    // Vérifier si la commande existe après mise à jour
    if (!updatedCommande) return sendNotFound(res, "Commande");

    return sendSuccess(res, updatedCommande, "Commande mise à jour");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Supprimer une commande par ID
const deleteCommande = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) return sendNotFound(res, "Commande");

    // Supprimer lignes et commande associées
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

// Récupérer le panier actif de l'utilisateur
const getPanier = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    // Rechercher le panier actif (false = panier actif/non validé) de l'utilisateur
    const panier = await Commande.findOne({
      user: req.user.id,
      status: false,
    }).populate("user", "nom prenom email");
    // Vérifier si le panier existe
    if (!panier) return sendNotFound(res, "Panier");
    // Récupérer les lignes de commande associées au panier
    const ligneCommandes = await LigneCommande.find({
      commande: panier._id,
    })
      .populate("accesoire", "nom_accesoire prix")
      .populate("voiture", "nom_model prix type_voiture");

    //  détails model_porsche pour chaque ligne de commande
    const lignesEnrichies = await Promise.all(
      ligneCommandes.map((line) => enrichirLigneAvecModelPorsche(line))
    );

    // Calculer total à payer pour le panier
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

// Récupérer l'historique des commandes de l'utilisateur
const getMyCommandes = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    // Rechercher les commandes validées (true = commandes validées/payées) de l'utilisateur
    const historique = await Commande.find({
      user: req.user.id,
      status: true,
    }).sort({ date_commande: -1 }); // Plus récentes d'abord

    return sendSuccess(res, historique);
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Récupérer ou créer le panier actif de l'utilisateur
const getOrCreatePanier = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    // Rechercher le panier actif (false = panier actif/non validé) de l'utilisateur
    let panier = await Commande.findOne({
      user: req.user.id,
      status: false,
    })
      .populate("user", "nom prenom email")
      .populate({
        path: "lignesCommande",
        populate: [{ path: "voiture" }, { path: "accesoire" }],
      });

    // Créer panier si inexistant , false = panier actif
    if (!panier) {
      const nouveauPanier = await new Commande({
        user: req.user.id,
        date_commande: new Date(),
        status: false,
        prix: 0,
        acompte: 0,
      }).save();

      // Recharger le panier avec l'information nécessaire
      panier = await Commande.findById(nouveauPanier._id)
        .populate("user", "nom prenom email")
        .populate({
          path: "lignesCommande",
          populate: [{ path: "voiture" }, { path: "accesoire" }],
        });
    }

    // Calculer total du panier
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

// Valider le panier et créer une commande
const validerPanier = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  // Rechercher le panier actif (false = panier actif/non validé) de l'utilisateur
  try {
    const panier = await Commande.findOne({
      user: req.user.id,
      status: false,
    }).populate({
      path: "lignesCommande",
      populate: [{ path: "voiture" }, { path: "accesoire" }],
    });
    // Vérifier si le panier existe
    if (!panier) return sendNotFound(res, "Panier");
    // Vérifier que le panier n'est pas vide
    if (!panier.lignesCommande || panier.lignesCommande.length === 0) {
      return sendError(res, "Le panier est vide", 400);
    }

    // Calculer prix total du panier
    const prixTotal = panier.lignesCommande.reduce(
      (total, ligne) => total + calculerMontantLigne(ligne),
      0
    );
    // Transformer en commande validée (true = commande validée)
    panier.status = true;
    panier.prix = prixTotal;
    panier.date_commande = new Date();
    await panier.save();

    // Récupérer la commande validée avec les détails complets
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

// Ajouter une configuration Porsche au panier
const ajouterConfigurationAuPanier = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    // Valider les données d'entrée
    const { model_porsche_id, quantite = 1 } = req.body;
    // Vérifier la présence de l'ID du modèle Porsche
    if (!model_porsche_id) {
      return sendValidationError(res, {
        details: [{ message: "model_porsche_id requis" }],
      });
    }

    // Import dynamique pour éviter dépendance circulaire
    const Model_porsche = (await import("../models/model_porsche.model.js"))
      .default;
    const Voiture = (await import("../models/voiture.model.js")).default;

    // Vérifier que le model_porsche existe et récupérer les détails nécessaires
    const modelPorsche = await Model_porsche.findById(model_porsche_id)
      .populate("voiture", "prix nom_model type_voiture")
      .populate("couleur_exterieur", "prix nom_couleur")
      .populate("couleur_interieur", "prix nom_couleur")
      .populate("taille_jante", "prix taille_jante");

    // Vérifier que la configuration Porsche existe
    if (!modelPorsche) {
      return sendNotFound(res, "Configuration Porsche");
    }

    // Vérifier que c'est bien une voiture neuve
    if (modelPorsche.voiture.type_voiture !== true) {
      return sendError(
        res,
        "Seules les voitures neuves peuvent être ajoutées au panier. Les occasions utilisent le système de réservation.",
        400
      );
    }

    // Calculer le prix total de la configuration
    const prixDetails = await calculerPrixTotalModelPorsche(modelPorsche);
    if (!prixDetails) {
      return sendError(
        res,
        "Impossible de calculer le prix de la configuration",
        500
      );
    }

    // Récupérer le prix total depuis les détails calculés
    const prixTotal = prixDetails.prix_total_avec_options;
    //  Utiliser l'acompte calculé par l'utilitaire ou 10% par défaut
    const acompte =
      Number(prixDetails.acompte_requis) || Math.round(prixTotal * 0.1);

    //  Récupérer ou créer le panier actif de l'utilisateur
    let panier = await Commande.findOne({
      user: req.user.id,
      status: false,
    });

    // Créer le panier s'il n'existe pas
    if (!panier) {
      panier = await new Commande({
        user: req.user.id,
        date_commande: new Date(),
        status: false,
        prix: 0,
        acompte: 0,
      }).save();
    }

    // Vérifier si cette configuration existe déjà dans le panier
    const ligneExistante = await LigneCommande.findOne({
      commande: panier._id,
      model_porsche_id: model_porsche_id,
    });

    if (ligneExistante) {
      // Incrémenter la quantité de la ligne existante
      ligneExistante.quantite += quantite;
      await ligneExistante.save();
    } else {
      // Créer nouvelle ligne de commande pour cette configuration Porsche
      await new LigneCommande({
        commande: panier._id,
        voiture: modelPorsche.voiture._id,
        model_porsche_id: model_porsche_id,
        quantite: quantite,
        prix: prixTotal,
        acompte: acompte,
        type_produit: true, // true = voiture neuve
      }).save();
    }

    // Récupérer le panier mis à jour avec les détails complets
    const panierMisAJour = await Commande.findById(panier._id).populate(
      "user",
      "nom prenom email"
    );
    // Récupérer les lignes de commande associées au panier
    const lignesCommande = await LigneCommande.find({
      commande: panier._id,
    })
      .populate("voiture", "nom_model prix type_voiture")
      .populate("accesoire", "nom_accesoire prix");

    // détails model_porsche pour chaque ligne de commande
    const lignesEnrichies = await Promise.all(
      lignesCommande.map((line) => enrichirLigneAvecModelPorsche(line))
    );

    // Calculer total à payer (somme des acomptes pour voitures, prix pour accesoires)
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

// Supprimer une ligne de commande du panier
const supprimerLignePanier = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    // Vérifier que la ligne existe et appartient au panier de l'utilisateur
    const { ligne_id } = req.params;
    const ligne = await LigneCommande.findById(ligne_id).populate({
      path: "commande",
      match: { user: req.user.id, status: false },
    });
    // Vérifier si la ligne de commande existe et appartient au panier
    if (!ligne || !ligne.commande) {
      return sendNotFound(res, "Ligne de commande dans votre panier");
    }
    // Supprimer la ligne de commande du panier
    await LigneCommande.findByIdAndDelete(ligne_id);

    return sendSuccess(res, null, "Article supprimé du panier");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Modifier la quantité d'une ligne de commande dans le panier
const modifierQuantitePanier = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    // Récupérer les paramètres de la requête
    const { ligne_id } = req.params;
    const { quantite } = req.body;
    // Valider la quantité
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
    // Vérifier si la ligne de commande existe et appartient au panier
    if (!ligne || !ligne.commande) {
      return sendNotFound(res, "Ligne de commande dans votre panier");
    }
    // Mettre à jour la quantité de la ligne de commande
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
