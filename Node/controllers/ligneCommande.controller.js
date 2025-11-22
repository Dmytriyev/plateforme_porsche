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
import { isOwnerOrAdmin } from "../utils/errorHandler.js";

// Créer une nouvelle ligne de commande (ajouter au panier)
const createLigneCommande = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);
  // Vérifier que le corps de la requête n'est pas vide
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendError(res, "Pas de données dans la requête", 400);
    }
    // Validation model_porsche_id pour les produits de type voiture neuve
    if (body.type_produit === true && !body.model_porsche_id) {
      return sendError(
        res,
        "Une configuration Porsche (model_porsche_id) est requise pour commander une voiture neuve",
        400
      );
    }
    //  Validation accesoire pour les produits non-voitures
    if (body.type_produit === false && !body.accesoire) {
      return sendError(res, "Un accesoire est requis pour ce type", 400);
    }

    // Empêcher la création directe avec le champ voiture rempli
    if (body.voiture) {
      return sendError(
        res,
        "Impossible de créer directement une voiture. Utilisez configurateur pour commander une voiture neuve.",
        403
      );
    }
    // Récupérer la configuration Porsche si type_produit est true (voiture neuve)
    if (body.type_produit === true && body.model_porsche_id) {
      // Importer le modèle Model_porsche de manière dynamique pour éviter les dépendances circulaires
      const Model_porsche = (await import("../models/model_porsche.model.js"))
        .default;
      // Chercher la configuration Porsche dans la base de données
      const config = await Model_porsche.findById(
        body.model_porsche_id
      ).populate("voiture", "type_voiture nom_model");

      if (!config) {
        return sendNotFound(res, "Configuration Porsche introuvable");
      }
      // Vérifier que la configuration est bien pour une voiture neuve
      if (config.voiture?.type_voiture !== true) {
        return sendError(
          res,
          `La configuration "${
            config.voiture?.nom_model || "sélectionnée"
          }" n'est pas disponible pour une voiture neuve. Veuillez vérifier votre sélection.`,
          400
        );
      }
      // Remplir automatiquement le champ voiture à partir du model_porsche
      body.voiture = config.voiture._id;
    }

    // Chercher panier actif (status: false = panier non validé)
    const commande = await Commande.findOne({
      user: req.user.id,
      status: false, // false = panier actif/non validé
    });
    if (!commande) {
      return sendNotFound(res, "Panier actif");
    }
    // On ne peut commander qu'une seule voiture neuve par ligne
    if (body.type_produit === true && body.quantite && body.quantite > 1) {
      return sendError(
        res,
        "Une voiture neuve ne peut être commandée qu'en quantité 1. Ajustez la quantité à 1.",
        400
      );
    }
    // Calculer prix et acompte
    const prixData = await calculerPrixEtAcompte(body);
    if (prixData.error) {
      return sendError(res, prixData.error, 400);
    }
    // Préparer données ligne de commande
    const line = {
      ...body,
      commande: commande._id.toString(),
      prix: prixData.prix,
      acompte: prixData.acompte,
    };

    // Validation ligne de commande
    const { error } = ligneCommandeValidation(line).ligneCommandeCreate;
    if (error) return sendValidationError(res, error);

    // Créer ligne de commande dans la base de données
    const ligneCommande = await new LigneCommande(line).save();
    const populatedLigne = await LigneCommande.findById(ligneCommande._id)
      .populate("voiture", "nom_model prix type_voiture")
      .populate({
        path: "model_porsche_id",
        populate: [
          { path: "voiture", select: "nom_model prix" },
          { path: "couleur_exterieur", select: "nom_couleur prix" },
          { path: "couleur_interieur", select: "nom_couleur prix" },
          { path: "taille_jante", select: "taille_jante prix" },
        ],
      })
      .populate("accesoire", "nom_accesoire prix")
      .populate("commande");

    // details de model porsche
    const response = await enrichirLigneAvecModelPorsche(populatedLigne);
    if (response.model_porsche_details) {
      response.note =
        "Voiture neuve configurée - Le montant à payer est l'acompte (20% du prix total).";
    }
    return sendSuccess(
      res,
      response,
      "Configuration Porsche ajoutée au panier",
      201
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Récupérer toutes les lignes de commande
const getAllLigneCommandes = async (req, res) => {
  try {
    const ligneCommandes = await LigneCommande.find()
      .populate("voiture", "nom_model prix type_voiture")
      .populate({
        path: "model_porsche_id",
        populate: [
          { path: "voiture", select: "nom_model prix" },
          { path: "couleur_exterieur", select: "nom_couleur prix" },
          { path: "couleur_interieur", select: "nom_couleur prix" },
          { path: "taille_jante", select: "taille_jante prix" },
        ],
      })
      .populate("accesoire", "nom_accesoire prix")
      .populate("commande", "date_commande status")
      .sort({ createdAt: -1 });
    return sendSuccess(res, ligneCommandes);
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Récupérer une ligne de commande par ID
const getLigneCommandeById = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);
  // Vérifier que l'utilisateur a le droit d'accéder à cette ligne de commande
  try {
    const ligneCommande = await LigneCommande.findById(req.params.id)
      .populate("voiture", "nom_model prix type_voiture description")
      .populate({
        path: "model_porsche_id",
        populate: [
          { path: "voiture", select: "nom_model prix" },
          { path: "couleur_exterieur", select: "nom_couleur prix" },
          { path: "couleur_interieur", select: "nom_couleur prix" },
          { path: "taille_jante", select: "taille_jante prix" },
        ],
      })
      .populate("accesoire", "nom_accesoire prix description")
      .populate("commande", "date_commande status user");

    if (!ligneCommande) return sendNotFound(res, "Ligne de commande");

    const commande = await Commande.findById(ligneCommande.commande);
    // Ligne appartient à l'utilisateur ou l'utilisateur est admin
    if (!isOwnerOrAdmin(commande, req.user)) {
      return sendForbidden(res);
    }
    // détails model_porsche
    const response = await enrichirLigneAvecModelPorsche(ligneCommande);
    if (response.model_porsche_details) {
      response.note =
        "Voiture neuve configurée - Le montant à payer est l'acompte.";
    }
    return sendSuccess(res, response);
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Mettre à jour une ligne de commande
const updateLigneCommande = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendError(res, "Pas de données dans la requête", 400);
    }
    // Empêcher la modification de champs critiques
    if (
      body.type_produit ||
      body.voiture ||
      body.model_porsche_id ||
      body.accesoire
    ) {
      return sendError(
        res,
        "Impossible de modifier le type de produit, la voiture, la configuration ou l'accesoire. Supprimez et recréez la ligne.",
        403
      );
    }

    // Vérifier existence de la ligne de commande
    const existingLigne = await LigneCommande.findById(req.params.id).populate(
      "commande"
    );
    if (!existingLigne) return sendNotFound(res, "Ligne de commande");
    const commande = await Commande.findById(existingLigne.commande);
    // Ligne appartient à l'utilisateur ou l'utilisateur est admin
    if (commande.user.toString() !== req.user.id && !req.user.isAdmin) {
      return sendForbidden(res);
    }
    // Vérifier que c'est encore un panier (status: false = panier actif)
    if (commande.status === true) {
      return sendError(res, "Impossible de modifier une commande validée", 403);
    }

    // Validation ligne de commande
    const { error } = ligneCommandeValidation(body).ligneCommandeUpdate;
    if (error) return sendValidationError(res, error);

    // Mettre à jour la ligne de commande
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

// Supprimer une ligne de commande
const deleteLigneCommande = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    // Vérifier existence de la ligne de commande
    const ligneCommande = await LigneCommande.findById(req.params.id);
    if (!ligneCommande) return sendNotFound(res, "Ligne de commande");

    // Vérifier existence de la commande associée
    const commande = await Commande.findById(ligneCommande.commande);
    if (!commande) return sendNotFound(res, "Commande");

    // Vérifier droits d'accès
    if (commande.user.toString() !== req.user.id && !req.user.isAdmin) {
      return sendForbidden(res);
    }

    // Vérifier que c'est encore un panier (status: false = panier actif)
    if (commande.status === true) {
      return sendError(
        res,
        "Impossible de supprimer une ligne d'une commande validée",
        403
      );
    }
    // Supprimer la ligne de commande
    await LigneCommande.findByIdAndDelete(req.params.id);
    return sendSuccess(res, { deletedId: req.params.id }, "Ligne supprimée");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Récupérer les lignes de commande d'une commande spécifique
const getLignesByCommande = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    // Vérifier existence de la commande
    const commande = await Commande.findById(req.params.commandeId);
    if (!commande) return sendNotFound(res, "Commande");

    // Vérifier droits d'accès
    if (commande.user.toString() !== req.user.id && !req.user.isAdmin) {
      return sendForbidden(res);
    }

    // Récupérer les lignes de commande associées
    const lignes = await LigneCommande.find({ commande: req.params.commandeId })
      .populate("voiture", "nom_model prix type_voiture description")
      .populate({
        path: "model_porsche_id",
        populate: [
          { path: "voiture", select: "nom_model prix" },
          { path: "couleur_exterieur", select: "nom_couleur prix" },
          { path: "couleur_interieur", select: "nom_couleur prix" },
          { path: "taille_jante", select: "taille_jante prix" },
        ],
      })
      .populate("accesoire", "nom_accesoire prix description")
      .sort({ createdAt: -1 });

    // Enrichir lignes avec détails configuration Porsche
    const lignesEnrichies = await Promise.all(
      lignes.map((ligne) => enrichirLigneAvecModelPorsche(ligne))
    );

    // Calculer total de la commande
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
      // Lignes de commande enrichies avec détails configuration Porsche
      lignes: lignesEnrichies,
      nombreArticles: lignes.length,
      total,
      note: "Le total inclut les acomptes pour les voitures neuves.",
    });
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Récupérer les lignes du panier actif de l'utilisateur connecté
const getMesLignesPanier = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    // Chercher le panier actif de l'utilisateur connecté (status: false = panier non validé)
    const panier = await Commande.findOne({ user: req.user.id, status: false });
    // Si pas de panier actif, retourner réponse vide
    if (!panier) {
      return sendSuccess(res, {
        message: "Aucun panier actif",
        lignes: [],
        nombreArticles: 0,
        total: 0,
      });
    }

    // Récupérer les lignes de commande associées au panier actif
    const lignes = await LigneCommande.find({ commande: panier._id })
      .populate("voiture", "nom_model prix type_voiture description")
      .populate({
        path: "model_porsche_id",
        populate: [
          { path: "voiture", select: "nom_model prix" },
          { path: "couleur_exterieur", select: "nom_couleur prix" },
          { path: "couleur_interieur", select: "nom_couleur prix" },
          { path: "taille_jante", select: "taille_jante prix" },
        ],
      })
      .populate("accesoire", "nom_accesoire prix description")
      .sort({ createdAt: -1 });

    // Enrichir lignes  avec détails configuration Porsche
    const lignesEnrichies = await Promise.all(
      lignes.map((ligne) => enrichirLigneAvecModelPorsche(ligne))
    );

    // Calculer total du panier
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

// Vider le panier actif de l'utilisateur connecté
const viderPanier = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    // Chercher le panier actif de l'utilisateur connecté (status: false = panier non validé)
    const panier = await Commande.findOne({ user: req.user.id, status: false });
    if (!panier) return sendNotFound(res, "Panier actif");
    // Supprimer toutes les lignes de commande associées au panier
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

// Mettre à jour la quantité d'une ligne de commande dans le panier actif de l'utilisateur connecté
const updateQuantite = async (req, res) => {
  if (!req.user) return sendUnauthorized(res);

  try {
    // Valider la quantité
    const { quantite } = req.body;
    // Quantité requise et doit être >= 1
    if (!quantite || quantite < 1) {
      return sendError(res, "Quantité invalide (doit être >= 1)", 400);
    }
    // Vérifier existence de la ligne de commande
    const ligneCommande = await LigneCommande.findById(req.params.id);
    if (!ligneCommande) return sendNotFound(res, "Ligne de commande");
    // Vérifier existence de la commande associée
    const commande = await Commande.findById(ligneCommande.commande);
    if (!commande) return sendNotFound(res, "Commande");
    // Vérifier droits d'accès
    if (commande.user.toString() !== req.user.id && !req.user.isAdmin) {
      return sendForbidden(res);
    }
    // Vérifier que c'est un panier (status: false = panier actif)
    if (commande.status === true) {
      return sendError(res, "Impossible de modifier une commande validée", 403);
    }
    // Une voiture neuve ne peut être commandée qu'en quantité 1
    if (ligneCommande.type_produit === true && quantite > 1) {
      return sendError(
        res,
        "Une voiture neuve ne peut être commandée qu'en quantité 1. Pour commander plusieurs voitures, créez des lignes séparées.",
        400
      );
    }

    // Mettre à jour  la quantité de la ligne de commande
    ligneCommande.quantite = quantite;
    await ligneCommande.save();

    const updated = await LigneCommande.findById(ligneCommande._id)
      .populate("voiture", "nom_model prix type_voiture")
      .populate("accesoire", "nom_accesoire prix")
      .populate("commande");
    // Calculer le sous-total de la ligne mise à jour
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
