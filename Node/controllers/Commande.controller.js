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

/**
 * Créer une nouvelle commande
 */
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

/**
 * Récupérer toutes les commandes
 */
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

/**
 * Récupérer une commande par ID avec ses lignes enrichies
 */
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

/**
 * Mettre à jour une commande
 */
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

/**
 * Supprimer une commande et ses lignes
 */
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

/**
 * Récupérer le panier actif de l'utilisateur
 */
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

/**
 * Récupérer l'historique des commandes de l'utilisateur
 */
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

/**
 * Créer ou récupérer le panier actif de l'utilisateur
 */
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

/**
 * Valider le panier (transformer en commande)
 */
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
};
