import LigneCommande from "../models/ligneCommande.model.js";
import Commande from "../models/Commande.model.js";
import ligneCommandeValidation from "../validations/ligneCommande.validation.js";
import {
  enrichirLigneAvecModelPorsche,
  calculerMontantLigne,
} from "../utils/prixCalculator.js";
import { calculerPrixEtAcompte } from "../utils/ligneCommande.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendValidationError,
} from "../utils/responses.js";

/**
 * Créer une ligne de commande (ajouter un article au panier)
 */
const createLigneCommande = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendError(res, "Pas de données dans la requête", 400);
    }

    // Validation type produit
    if (body.type_produit === true && !body.voiture) {
      return sendError(res, "Une voiture est requise pour ce type", 400);
    }
    if (body.type_produit === false && !body.accesoire) {
      return sendError(res, "Un accessoire est requis pour ce type", 400);
    }

    // Chercher panier actif
    const commande = await Commande.findOne({
      user: req.user.id,
      status: true,
    });
    if (!commande) {
      return sendNotFound(res, "Panier actif");
    }

    // Calculer prix et acompte
    const prixData = await calculerPrixEtAcompte(body);
    if (prixData.error) {
      return sendError(res, prixData.error, 400);
    }

    const line = {
      ...body,
      commande: commande._id.toString(),
      prix: prixData.prix,
      acompte: prixData.acompte,
    };

    // Validation
    const { error } = ligneCommandeValidation(line).ligneCommandeCreate;
    if (error) return sendValidationError(res, error);

    // Créer ligne
    const ligneCommande = await new LigneCommande(line).save();
    const populatedLigne = await LigneCommande.findById(ligneCommande._id)
      .populate("voiture", "nom_model prix type_voiture")
      .populate("accesoire", "nom_accesoire prix")
      .populate("commande");

    // Enrichir avec détails model_porsche
    const response = await enrichirLigneAvecModelPorsche(populatedLigne);
    if (response.model_porsche_details) {
      response.note = "Le montant à payer est l'acompte.";
    }

    return sendSuccess(res, response, "Article ajouté au panier", 201);
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Récupérer toutes les lignes de commande
 */
const getAllLigneCommandes = async (req, res) => {
  try {
    const ligneCommandes = await LigneCommande.find()
      .populate("voiture", "nom_model prix type_voiture")
      .populate("accesoire", "nom_accesoire prix")
      .populate("commande", "date_commande status")
      .sort({ createdAt: -1 });
    return sendSuccess(res, ligneCommandes);
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Récupérer une ligne de commande par ID
 */
const getLigneCommandeById = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    const ligneCommande = await LigneCommande.findById(req.params.id)
      .populate("voiture", "nom_model prix type_voiture description")
      .populate("accesoire", "nom_accesoire prix description")
      .populate("commande", "date_commande status user");

    if (!ligneCommande) return sendNotFound(res, "Ligne de commande");

    // Vérifier droits d'accès
    const commande = await Commande.findById(ligneCommande.commande);
    if (commande.user.toString() !== req.user.id && !req.user.isAdmin) {
      return sendForbidden(res);
    }

    // Enrichir avec détails model_porsche
    const response = await enrichirLigneAvecModelPorsche(ligneCommande);
    if (response.model_porsche_details) {
      response.note = "Le montant à payer est l'acompte.";
    }

    return sendSuccess(res, response);
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Mettre à jour une ligne de commande
 */
const updateLigneCommande = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendError(res, "Pas de données dans la requête", 400);
    }

    const existingLigne = await LigneCommande.findById(req.params.id).populate(
      "commande"
    );
    if (!existingLigne) return sendNotFound(res, "Ligne de commande");

    // Vérifier droits d'accès
    const commande = await Commande.findById(existingLigne.commande);
    if (commande.user.toString() !== req.user.id && !req.user.isAdmin) {
      return sendForbidden(res);
    }

    // Vérifier que c'est encore un panier
    if (commande.status === false) {
      return sendError(res, "Impossible de modifier une commande validée", 403);
    }

    const { error } = ligneCommandeValidation(body).ligneCommandeUpdate;
    if (error) return sendValidationError(res, error);

    const updatedLigne = await LigneCommande.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    )
      .populate("voiture", "nom_model prix type_voiture")
      .populate("accesoire", "nom_accesoire prix")
      .populate("commande");

    return sendSuccess(res, updatedLigne, "Ligne mise à jour");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Supprimer une ligne de commande (retirer du panier)
 */
const deleteLigneCommande = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    const ligneCommande = await LigneCommande.findById(req.params.id);
    if (!ligneCommande) return sendNotFound(res, "Ligne de commande");

    const commande = await Commande.findById(ligneCommande.commande);
    if (!commande) return sendNotFound(res, "Commande");

    // Vérifier droits d'accès
    if (commande.user.toString() !== req.user.id && !req.user.isAdmin) {
      return sendForbidden(res);
    }

    // Vérifier que c'est encore un panier
    if (commande.status === false) {
      return sendError(
        res,
        "Impossible de supprimer une ligne d'une commande validée",
        403
      );
    }

    await LigneCommande.findByIdAndDelete(req.params.id);

    return sendSuccess(res, { deletedId: req.params.id }, "Ligne supprimée");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Récupérer toutes les lignes d'une commande spécifique
 */
const getLignesByCommande = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    const commande = await Commande.findById(req.params.commandeId);
    if (!commande) return sendNotFound(res, "Commande");

    // Vérifier droits d'accès
    if (commande.user.toString() !== req.user.id && !req.user.isAdmin) {
      return sendForbidden(res);
    }

    const lignes = await LigneCommande.find({ commande: req.params.commandeId })
      .populate("voiture", "nom_model prix type_voiture description")
      .populate("accesoire", "nom_accesoire prix description")
      .sort({ createdAt: -1 });

    // Enrichir lignes
    const lignesEnrichies = await Promise.all(
      lignes.map((ligne) => enrichirLigneAvecModelPorsche(ligne))
    );

    // Calculer total
    const total = lignes.reduce(
      (sum, ligne) => sum + calculerMontantLigne(ligne),
      0
    );

    return sendSuccess(res, {
      commande: {
        _id: commande._id,
        date_commande: commande.date_commande,
        status: commande.status,
      },
      lignes: lignesEnrichies,
      nombreArticles: lignes.length,
      total,
      note: "Le total inclut les acomptes pour les voitures neuves.",
    });
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Récupérer les lignes du panier actif de l'utilisateur
 */
const getMesLignesPanier = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    const panier = await Commande.findOne({ user: req.user.id, status: true });

    if (!panier) {
      return sendSuccess(res, {
        message: "Aucun panier actif",
        lignes: [],
        nombreArticles: 0,
        total: 0,
      });
    }

    const lignes = await LigneCommande.find({ commande: panier._id })
      .populate("voiture", "nom_model prix type_voiture description")
      .populate("accesoire", "nom_accesoire prix description")
      .sort({ createdAt: -1 });

    // Enrichir lignes
    const lignesEnrichies = await Promise.all(
      lignes.map((ligne) => enrichirLigneAvecModelPorsche(ligne))
    );

    // Calculer total
    const total = lignes.reduce(
      (sum, ligne) => sum + calculerMontantLigne(ligne),
      0
    );

    return sendSuccess(res, {
      panier: {
        _id: panier._id,
        date_commande: panier.date_commande,
      },
      lignes: lignesEnrichies,
      nombreArticles: lignes.length,
      total,
      note: "Le total à payer inclut les acomptes pour les voitures neuves.",
    });
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Vider le panier (supprimer toutes les lignes)
 */
const viderPanier = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    const panier = await Commande.findOne({ user: req.user.id, status: true });
    if (!panier) return sendNotFound(res, "Panier actif");

    const result = await LigneCommande.deleteMany({ commande: panier._id });

    return sendSuccess(
      res,
      { nombreLignesSupprimees: result.deletedCount },
      "Panier vidé avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Mettre à jour la quantité d'une ligne de commande
 */
const updateQuantite = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    const { quantite } = req.body;

    if (!quantite || quantite < 1) {
      return sendError(res, "Quantité invalide (doit être >= 1)", 400);
    }

    const ligneCommande = await LigneCommande.findById(req.params.id);
    if (!ligneCommande) return sendNotFound(res, "Ligne de commande");

    const commande = await Commande.findById(ligneCommande.commande);
    if (!commande) return sendNotFound(res, "Commande");

    // Vérifier droits d'accès
    if (commande.user.toString() !== req.user.id && !req.user.isAdmin) {
      return sendForbidden(res);
    }

    // Vérifier que c'est un panier
    if (commande.status === false) {
      return sendError(res, "Impossible de modifier une commande validée", 403);
    }

    // Mettre à jour
    ligneCommande.quantite = quantite;
    await ligneCommande.save();

    const updated = await LigneCommande.findById(ligneCommande._id)
      .populate("voiture", "nom_model prix type_voiture")
      .populate("accesoire", "nom_accesoire prix")
      .populate("commande");

    const sousTotal = calculerMontantLigne(updated);

    return sendSuccess(
      res,
      { ligne: updated, sousTotal },
      "Quantité mise à jour"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

export {
  createLigneCommande,
  getAllLigneCommandes,
  getLigneCommandeById,
  updateLigneCommande,
  deleteLigneCommande,
  getLignesByCommande,
  getMesLignesPanier,
  viderPanier,
  updateQuantite,
};
