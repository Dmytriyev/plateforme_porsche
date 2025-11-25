/**
 * Contrôleur Panier
 * - Opérations sur le panier utilisateur : ajout/suppression d'articles,
 *   calcul des prix et préparation pour le paiement
 */
import Accesoire from "../models/accesoire.model.js";
import { calculerPrixTotalModelPorsche } from "../utils/prixCalculator.js";
import Commande from "../models/Commande.model.js";
import LigneCommande from "../models/ligneCommande.model.js";
import Model_porsche from "../models/model_porsche.model.js";
import Voiture from "../models/voiture.model.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendValidationError,
} from "../utils/responses.js";

/**
 * Helper pour récupérer les lignes de commande avec toutes les relations populées
 */
const getLignesCommandePopulees = async (panierId) => {
  return await LigneCommande.find({ commande: panierId })
    .populate("voiture")
    .populate({
      path: "accesoire",
      populate: [{ path: "photo_accesoire" }, { path: "couleur_accesoire" }],
    })
    .populate({
      path: "model_porsche_id",
      populate: [
        { path: "voiture" },
        { path: "photo_porsche" },
        { path: "couleur_exterieur" },
        { path: "couleur_interieur" },
        { path: "taille_jante" },
        { path: "package" },
        { path: "siege" },
      ],
    });
};

/**
 * Ajouter une voiture neuve au panier
 * - Crée une ligne de commande avec acompte (10%)
 * - Crée une notification pour l'utilisateur et le staff
 */
const ajouterVoitureNeuveAuPanier = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user) {
      return sendUnauthorized(
        res,
        "Vous devez être connecté pour acheter une voiture. Veuillez vous connecter ou créer un compte."
      );
    }

    const { model_porsche_id } = req.body;

    if (!model_porsche_id) {
      return sendValidationError(res, "L'ID du modèle Porsche est requis");
    }

    // Vérifier que le model_porsche existe
    const modelPorsche = await Model_porsche.findById(
      model_porsche_id
    ).populate("voiture");

    if (!modelPorsche) {
      return sendNotFound(res, "Modèle Porsche");
    }

    // Vérifier que c'est bien une voiture neuve
    if (modelPorsche.voiture.type_voiture !== true) {
      return sendValidationError(
        res,
        "Seules les voitures neuves peuvent être ajoutées au panier. Les voitures d'occasion doivent être réservées."
      );
    }

    // Calculer le prix total de la configuration
    const prixDetails = await calculerPrixTotalModelPorsche(model_porsche_id);
    const prixTotal = prixDetails.prix_total_avec_options;

    // Calculer l'acompte (10%)
    const acompte = Math.round(prixDetails.acompte_requis);

    // Trouver ou créer le panier (commande avec status = false)
    let panier = await Commande.findOne({
      user: req.user.id,
      status: false,
    });

    if (!panier) {
      // Créer un nouveau panier
      panier = await new Commande({
        user: req.user.id,
        status: false,
        prix: 0,
        acompte: 0,
        date_commande: new Date(),
      }).save();
    }

    // Créer automatiquement une instance de voiture pour cette ligne de commande
    const nouvelleVoiture = await new Voiture({
      nom_model: modelPorsche.voiture.nom_model,
      type_voiture: true, // Voiture neuve
      description: modelPorsche.description || modelPorsche.voiture.description,
      prix: prixTotal,
      kilometrage: 0,
      model_porsche: model_porsche_id,
    }).save();

    // Créer une ligne de commande
    await new LigneCommande({
      type_produit: true, // true = voiture
      quantite: 1,
      prix: prixTotal,
      acompte: acompte,
      voiture: nouvelleVoiture._id,
      model_porsche_id: model_porsche_id,
      commande: panier._id,
    }).save();

    // Mettre à jour le panier
    panier.prix += prixTotal;
    panier.acompte += acompte;
    await panier.save();

    // Récupérer le panier complet avec les lignes de commande
    const panierComplet = await Commande.findById(panier._id)
      .populate("user", "nom prenom email")
      .lean();

    const lignesCommande = await getLignesCommandePopulees(panier._id);

    return sendSuccess(
      res,
      {
        panier: panierComplet,
        lignesCommande,
        message: "Voiture neuve ajoutée au panier avec succès",
      },
      "Voiture neuve ajoutée au panier avec succès",
      201
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Ajouter un accessoire au panier
 * - Crée une ligne de commande pour l'accessoire
 */
const ajouterAccessoireAuPanier = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user) {
      return sendUnauthorized(
        res,
        "Vous devez être connecté pour ajouter un accessoire au panier. Veuillez vous connecter ou créer un compte."
      );
    }

    const { accesoire_id, quantite } = req.body;

    if (!accesoire_id) {
      return sendValidationError(res, "L'ID de l'accessoire est requis");
    }

    const quantiteFinale = quantite || 1;

    if (quantiteFinale < 1 || quantiteFinale > 1000) {
      return sendValidationError(res, "La quantité doit être entre 1 et 1000");
    }

    // Vérifier que l'accessoire existe
    const accesoire = await Accesoire.findById(accesoire_id);

    if (!accesoire) {
      return sendNotFound(res, "Accessoire");
    }

    // Calculer le prix total
    const prixTotal = accesoire.prix * quantiteFinale;

    // Trouver ou créer le panier (commande avec status = false)
    let panier = await Commande.findOne({
      user: req.user.id,
      status: false,
    });

    if (!panier) {
      // Créer un nouveau panier
      panier = await new Commande({
        user: req.user.id,
        status: false,
        prix: 0,
        acompte: 0,
        date_commande: new Date(),
      }).save();
    }

    // Vérifier si l'accessoire existe déjà dans le panier
    const ligneExistante = await LigneCommande.findOne({
      commande: panier._id,
      accesoire: accesoire_id,
    });

    if (ligneExistante) {
      // Mettre à jour la quantité et le prix
      ligneExistante.quantite += quantiteFinale;
      ligneExistante.prix += prixTotal;
      await ligneExistante.save();

      // Mettre à jour le panier
      panier.prix += prixTotal;
      await panier.save();

      return sendSuccess(
        res,
        {
          panier,
          ligneCommande: ligneExistante,
          message: "Quantité d'accessoire mise à jour dans le panier",
        },
        "Quantité d'accessoire mise à jour dans le panier",
        200
      );
    }

    // Créer une nouvelle ligne de commande
    await new LigneCommande({
      type_produit: false, // false = accessoire
      quantite: quantiteFinale,
      prix: prixTotal,
      acompte: 0, // Pas d'acompte pour les accessoires
      accesoire: accesoire_id,
      commande: panier._id,
    }).save();

    // Mettre à jour le panier
    panier.prix += prixTotal;
    await panier.save();

    // Récupérer le panier complet avec les lignes de commande
    const panierComplet = await Commande.findById(panier._id)
      .populate("user", "nom prenom email")
      .lean();

    const lignesCommande = await getLignesCommandePopulees(panier._id);

    return sendSuccess(
      res,
      {
        panier: panierComplet,
        lignesCommande,
        message: "Accessoire ajouté au panier avec succès",
      },
      "Accessoire ajouté au panier avec succès",
      201
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Récupérer le panier de l'utilisateur connecté
 */
const getPanier = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user) {
      return sendUnauthorized(res, "Authentification requise");
    }

    // Trouver le panier (commande avec status = false)
    const panier = await Commande.findOne({
      user: req.user.id,
      status: false,
    }).populate("user", "nom prenom email");

    if (!panier) {
      return sendSuccess(res, {
        panier: null,
        lignesCommande: [],
        message: "Votre panier est vide",
      });
    }

    // Récupérer les lignes de commande avec toutes les relations
    const lignesCommande = await getLignesCommandePopulees(panier._id);

    return sendSuccess(res, {
      commande: panier,
      panier,
      lignesCommande,
      total: panier.prix,
      acompte: panier.acompte,
    });
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Modifier la quantité d'une ligne de panier
 */
const modifierQuantiteLigne = async (req, res) => {
  try {
    if (!req.user) {
      return sendUnauthorized(res, "Authentification requise");
    }

    const { ligne_id } = req.params;
    const { quantite } = req.body;

    if (!quantite || quantite < 1) {
      return sendValidationError(res, "La quantité doit être au moins 1");
    }

    // Trouver la ligne de commande
    const ligne = await LigneCommande.findById(ligne_id).populate("commande");

    if (!ligne) {
      return sendNotFound(res, "Ligne de commande");
    }

    // Vérifier que la ligne appartient au panier de l'utilisateur
    if (ligne.commande.user.toString() !== req.user.id) {
      return sendUnauthorized(res, "Non autorisé à modifier cette ligne");
    }

    // Calculer la différence de prix
    const ancienneQuantite = ligne.quantite;
    const prixUnitaire = ligne.prix / ancienneQuantite;
    const nouveauPrix = prixUnitaire * quantite;
    const diffPrix = nouveauPrix - ligne.prix;

    // Mettre à jour la ligne
    ligne.quantite = quantite;
    ligne.prix = nouveauPrix;
    await ligne.save();

    // Mettre à jour le prix total du panier
    const panier = await Commande.findById(ligne.commande._id);
    panier.prix += diffPrix;
    await panier.save();

    return sendSuccess(res, { ligne, panier }, "Quantité mise à jour");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Supprimer une ligne du panier
 */
const supprimerLignePanier = async (req, res) => {
  try {
    if (!req.user) {
      return sendUnauthorized(res, "Authentification requise");
    }

    const { ligne_id } = req.params;

    // Trouver la ligne de commande
    const ligne = await LigneCommande.findById(ligne_id).populate("commande");

    if (!ligne) {
      return sendNotFound(res, "Ligne de commande");
    }

    // Vérifier que la ligne appartient au panier de l'utilisateur
    if (ligne.commande.user.toString() !== req.user.id) {
      return sendUnauthorized(res, "Non autorisé à supprimer cette ligne");
    }

    // Mettre à jour le prix total du panier
    const panier = await Commande.findById(ligne.commande._id);
    panier.prix -= ligne.prix;
    panier.acompte -= ligne.acompte || 0;
    await panier.save();

    // Supprimer la ligne
    await LigneCommande.findByIdAndDelete(ligne_id);

    return sendSuccess(res, { panier }, "Article retiré du panier avec succès");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

export default {
  ajouterVoitureNeuveAuPanier,
  ajouterAccessoireAuPanier,
  getPanier,
  modifierQuantiteLigne,
  supprimerLignePanier,
};
