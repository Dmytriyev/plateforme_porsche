import LigneCommande from "../models/ligneCommande.model.js";
import Commande from "../models/Commande.model.js";
import Voiture from "../models/voiture.model.js";
import Accesoire from "../models/accesoire.model.js";
import ligneCommandeValidation from "../validations/ligneCommande.validation.js";

const createLigneCommande = async (req, res) => {
  try {
    const { body } = req;

    // Vérifier l'authentification
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    // Vérifier les données en premier
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Validation de type_produit et produit correspondant
    if (body.type_produit === true && !body.voiture) {
      return res.status(400).json({
        message: "Une voiture est requise quand type_produit est true",
      });
    }

    if (body.type_produit === false && !body.accesoire) {
      return res.status(400).json({
        message: "Un accessoire est requis quand type_produit est false",
      });
    }

    // Chercher la commande active (panier)
    const commande = await Commande.findOne({
      user: req.user.id,
      status: true,
    });

    if (!commande) {
      return res.status(404).json({
        message: "Aucune commande active trouvée pour cet utilisateur",
      });
    }

    // Récupérer le prix du produit et appliquer la logique métier
    let prixUnitaire = 0;
    let acompte = 0;

    if (body.type_produit === true && body.voiture) {
      const voiture = await Voiture.findById(body.voiture);
      if (!voiture) {
        return res.status(404).json({ message: "Voiture introuvable" });
      }

      // LOGIQUE MÉTIER: Voiture neuf nécessite un acompte
      if (voiture.type_voiture === true) {
        // Voiture neuf
        prixUnitaire = voiture.prix || 0;
        // Acompte par défaut: 20% du prix (ou celui fourni dans body)
        acompte = body.acompte || prixUnitaire * 0.2;

        // Vérifier que l'acompte n'est pas supérieur au prix total
        if (acompte > prixUnitaire) {
          return res.status(400).json({
            message: "L'acompte ne peut pas être supérieur au prix total",
          });
        }
      } else {
        // Voiture d'occasion ne peut pas être dans une commande (seulement réservation)
        return res.status(400).json({
          message:
            "Les voitures d'occasion ne peuvent pas être commandées. Veuillez faire une réservation.",
        });
      }
    } else if (body.type_produit === false && body.accesoire) {
      const accesoire = await Accesoire.findById(body.accesoire);
      if (!accesoire) {
        return res.status(404).json({ message: "Accessoire introuvable" });
      }
      // LOGIQUE MÉTIER: Accessoire se paye en prix complet
      prixUnitaire = accesoire.prix || 0;
      acompte = 0; // Pas d'acompte pour les accessoires
    }

    const line = {
      ...body,
      commande: commande._id.toString(),
      prix: body.prix || prixUnitaire,
      acompte: acompte,
    };

    const { error } = ligneCommandeValidation(line).ligneCommandeCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const ligneCommande = new LigneCommande(line);
    const newLigneCommande = await ligneCommande.save();

    // Retourner avec populate pour avoir les détails
    const populatedLigne = await LigneCommande.findById(newLigneCommande._id)
      .populate("voiture", "nom_model prix type_voiture")
      .populate("accesoire", "nom_accesoire prix")
      .populate("commande");

    return res.status(201).json(populatedLigne);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllLigneCommandes = async (req, res) => {
  try {
    const ligneCommandes = await LigneCommande.find()
      .populate("voiture", "nom_model prix type_voiture")
      .populate("accesoire", "nom_accesoire prix")
      .populate("commande", "date_commande status")
      .sort({ createdAt: -1 });
    return res.status(200).json(ligneCommandes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getLigneCommandeById = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const ligneCommande = await LigneCommande.findById(req.params.id)
      .populate("voiture", "nom_model prix type_voiture description")
      .populate("accesoire", "nom_accesoire prix description")
      .populate("commande", "date_commande status user");

    if (!ligneCommande) {
      return res.status(404).json({ message: "ligneCommande n'existe pas" });
    }

    // Vérifier que l'utilisateur est propriétaire de la commande ou admin
    const commande = await Commande.findById(ligneCommande.commande);
    if (commande.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    return res.status(200).json(ligneCommande);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const updateLigneCommande = async (req, res) => {
  try {
    const { body } = req;

    // Vérifier l'authentification
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Vérifier que la ligne existe
    const existingLigne = await LigneCommande.findById(req.params.id).populate(
      "commande"
    );
    if (!existingLigne) {
      return res.status(404).json({ message: "ligneCommande n'existe pas" });
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    const commande = await Commande.findById(existingLigne.commande);
    if (commande.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // Vérifier que la commande est encore un panier
    if (commande.status === false) {
      return res.status(403).json({
        message: "Impossible de modifier une ligne d'une commande validée",
      });
    }

    const { error } = ligneCommandeValidation(body).ligneCommandeUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const updatedLigneCommande = await LigneCommande.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    )
      .populate("voiture", "nom_model prix type_voiture")
      .populate("accesoire", "nom_accesoire prix")
      .populate("commande");

    return res.status(200).json(updatedLigneCommande);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteLigneCommande = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    // Vérifier d'abord si la ligne existe
    const ligneCommande = await LigneCommande.findById(req.params.id);

    if (!ligneCommande) {
      return res.status(404).json({ message: "ligneCommande n'existe pas" });
    }

    // Vérifier si la commande est encore un panier (status: true)
    const commande = await Commande.findById(ligneCommande.commande);

    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    if (commande.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    if (commande.status === false) {
      return res.status(403).json({
        message:
          "Impossible de supprimer une ligne d'une commande déjà validée",
      });
    }

    await LigneCommande.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "ligneCommande a été supprimée",
      deletedId: req.params.id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Récupérer toutes les lignes d'une commande spécifique
const getLignesByCommande = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const commandeId = req.params.commandeId;

    // Vérifier que la commande existe
    const commande = await Commande.findById(commandeId);
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    if (commande.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const lignes = await LigneCommande.find({ commande: commandeId })
      .populate("voiture", "nom_model prix type_voiture description")
      .populate("accesoire", "nom_accesoire prix description")
      .sort({ createdAt: -1 });

    // Calculer le total
    const total = lignes.reduce((sum, ligne) => {
      return sum + (ligne.prix * ligne.quantite || 0);
    }, 0);

    return res.status(200).json({
      commande: {
        _id: commande._id,
        date_commande: commande.date_commande,
        status: commande.status,
      },
      lignes,
      nombreArticles: lignes.length,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Récupérer les lignes du panier actif de l'utilisateur
const getMesLignesPanier = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    // Chercher le panier actif
    const panier = await Commande.findOne({ user: req.user.id, status: true });

    if (!panier) {
      return res.status(200).json({
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

    // Calculer le total (utiliser acompte pour voitures, prix pour accessoires)
    const total = lignes.reduce((sum, ligne) => {
      const montant =
        ligne.type_produit && ligne.acompte > 0
          ? ligne.acompte * ligne.quantite
          : ligne.prix * ligne.quantite;
      return sum + (montant || 0);
    }, 0);

    return res.status(200).json({
      panier: {
        _id: panier._id,
        date_commande: panier.date_commande,
      },
      lignes,
      nombreArticles: lignes.length,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Vider le panier (supprimer toutes les lignes du panier actif)
const viderPanier = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    // Chercher le panier actif
    const panier = await Commande.findOne({ user: req.user.id, status: true });

    if (!panier) {
      return res.status(404).json({ message: "Aucun panier actif trouvé" });
    }

    // Supprimer toutes les lignes du panier
    const result = await LigneCommande.deleteMany({ commande: panier._id });

    return res.status(200).json({
      message: "Panier vidé avec succès",
      nombreLignesSupprimees: result.deletedCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Mettre à jour la quantité d'une ligne de commande
const updateQuantite = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const { quantite } = req.body;

    if (!quantite || quantite < 1) {
      return res.status(400).json({
        message: "Quantité invalide (doit être >= 1)",
      });
    }

    // Vérifier que la ligne existe
    const ligneCommande = await LigneCommande.findById(req.params.id);
    if (!ligneCommande) {
      return res.status(404).json({ message: "ligneCommande n'existe pas" });
    }

    // Vérifier la commande
    const commande = await Commande.findById(ligneCommande.commande);
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    if (commande.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // Vérifier que c'est encore un panier
    if (commande.status === false) {
      return res.status(403).json({
        message: "Impossible de modifier une commande validée",
      });
    }

    // Mettre à jour la quantité
    ligneCommande.quantite = quantite;
    await ligneCommande.save();

    const updated = await LigneCommande.findById(ligneCommande._id)
      .populate("voiture", "nom_model prix type_voiture")
      .populate("accesoire", "nom_accesoire prix")
      .populate("commande");

    return res.status(200).json({
      message: "Quantité mise à jour avec succès",
      ligne: updated,
      sousTotal: updated.prix * updated.quantite,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Récupérer les statistiques des lignes de commande pour l'admin
const getStatistiquesLignes = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    // Vérifier les droits admin
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Accès réservé aux administrateurs" });
    }

    // Statistiques globales
    const totalLignes = await LigneCommande.countDocuments();

    // Lignes par type de produit
    const lignesVoitures = await LigneCommande.countDocuments({
      type_produit: true,
    });
    const lignesAccessoires = await LigneCommande.countDocuments({
      type_produit: false,
    });

    // Produits les plus commandés
    const topVoitures = await LigneCommande.aggregate([
      { $match: { type_produit: true } },
      { $group: { _id: "$voiture", count: { $sum: "$quantite" } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "voitures",
          localField: "_id",
          foreignField: "_id",
          as: "voiture",
        },
      },
      { $unwind: "$voiture" },
    ]);

    const topAccessoires = await LigneCommande.aggregate([
      { $match: { type_produit: false } },
      { $group: { _id: "$accesoire", count: { $sum: "$quantite" } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "accesoires",
          localField: "_id",
          foreignField: "_id",
          as: "accesoire",
        },
      },
      { $unwind: "$accesoire" },
    ]);

    // Chiffre d'affaires par type
    const caVoitures = await LigneCommande.aggregate([
      { $match: { type_produit: true } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$prix", "$quantite"] } },
        },
      },
    ]);

    const caAccessoires = await LigneCommande.aggregate([
      { $match: { type_produit: false } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$prix", "$quantite"] } },
        },
      },
    ]);

    const statistiques = {
      total: {
        lignes: totalLignes,
        voitures: lignesVoitures,
        accessoires: lignesAccessoires,
      },
      chiffreAffaires: {
        voitures: caVoitures[0]?.total || 0,
        accessoires: caAccessoires[0]?.total || 0,
        total: (caVoitures[0]?.total || 0) + (caAccessoires[0]?.total || 0),
      },
      topVentes: {
        voitures: topVoitures.map((item) => ({
          voiture: item.voiture.nom_model,
          quantite: item.count,
        })),
        accessoires: topAccessoires.map((item) => ({
          accessoire: item.accesoire.nom_accesoire,
          quantite: item.count,
        })),
      },
    };

    return res.status(200).json(statistiques);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
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
  getStatistiquesLignes,
};
