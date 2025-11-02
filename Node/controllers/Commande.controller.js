import Commande from "../models/Commande.model.js";
import commandeValidation from "../validations/Commande.validation.js";
import LigneCommande from "../models/ligneCommande.model.js";

const createCommande = async (req, res) => {
  // Vérifier authentification
  if (!req.user) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Ajouter l'utilisateur connecté
    body.user = req.user.id;

    const { error } = commandeValidation(body).CommandeCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const commande = new Commande(body);
    const newCommande = await commande.save();

    // Retourner avec populate
    const populatedCommande = await Commande.findById(newCommande._id).populate(
      "user",
      "name email"
    );

    return res.status(201).json(populatedCommande);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find()
      .populate("user", "name email")
      .sort({ date_commande: -1 });
    return res.status(200).json(commandes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!commande) {
      return res.status(404).json({ message: "Commande n'existe pas" });
    }
    const ligneCommandes = await LigneCommande.find({
      commande: req.params.id,
    })
      .populate("accesoire", "prix nom_accesoire")
      .populate("voiture", "prix nom_model type_voiture");

    const total = ligneCommandes.reduce((sum, line) => {
      // Vérifier le type de produit et utiliser le bon prix
      let prix = 0;
      if (line.voiture && line.acompte > 0) {
        prix = line.acompte;
      } else if (line.accesoire && line.accesoire.prix) {
        prix = line.accesoire.prix;
      } else if (line.prix) {
        // Utiliser le prix sauvegardé dans la ligne si disponible
        prix = line.prix;
      }
      return sum + prix * line.quantite;
    }, 0);
    return res
      .status(200)
      .json({ ...commande.toObject(), ligneCommandes, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const updateCommande = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = commandeValidation(body).CommandeUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const updatedCommande = await Commande.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    ).populate("user", "name email");

    if (!updatedCommande) {
      return res.status(404).json({ message: "Commande n'existe pas" });
    }
    return res.status(200).json(updatedCommande);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteCommande = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: "Commande n'existe pas" });
    }

    // Supprimer toutes les lignes de commande associées
    await LigneCommande.deleteMany({ commande: req.params.id });

    // Supprimer la commande
    await Commande.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Commande et ses lignes ont été supprimées avec succès",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getPanier = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Non autorisé" });
  }
  try {
    const panier = await Commande.findOne({
      user: req.user.id,
      status: true,
    }).populate("user", "name email");
    if (!panier) {
      return res.status(404).json({ message: "Panier n'existe pas" });
    }
    const ligneCommandes = await LigneCommande.find({
      commande: panier._id,
    })
      .populate("accesoire", "nom_accesoire prix")
      .populate("voiture", "nom_model prix type_voiture");

    const total = ligneCommandes.reduce((sum, line) => {
      // Vérifier le type de produit et utiliser le bon prix
      let prix = 0;
      if (line.voiture && line.acompte > 0) {
        prix = line.acompte;
      } else if (line.accesoire && line.accesoire.prix) {
        prix = line.accesoire.prix;
      } else if (line.prix) {
        // Utiliser le prix sauvegardé dans la ligne si disponible
        prix = line.prix;
      }
      return sum + prix * line.quantite;
    }, 0);

    return res
      .status(200)
      .json({ ...panier.toObject(), ligneCommandes, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getMyCommandes = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Non autorisé" });
  }
  try {
    const historique = await Commande.find({
      user: req.user.id,
      status: false,
    }).sort({ date_commande: -1 });
    return res.status(200).json(historique);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Créer ou récupérer le panier actif
const getOrCreatePanier = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  try {
    // Chercher un panier existant (status = true)
    let panier = await Commande.findOne({
      user: req.user.id,
      status: true,
    })
      .populate("user", "name email")
      .populate({
        path: "lignesCommande",
        populate: [
          { path: "voiture", populate: "model_porsche_actuel" },
          { path: "accessoire" },
        ],
      });

    // Si pas de panier, en créer un
    if (!panier) {
      const nouveauPanier = new Commande({
        user: req.user.id,
        date_commande: new Date(),
        status: true,
        prix: 0,
        acompte: 0,
      });
      await nouveauPanier.save();

      panier = await Commande.findById(nouveauPanier._id)
        .populate("user", "name email")
        .populate({
          path: "lignesCommande",
          populate: [
            { path: "voiture", populate: "model_porsche_actuel" },
            { path: "accessoire" },
          ],
        });
    }

    // Calculer le total
    const lignesCommande = panier.lignesCommande || [];
    const prixTotal = lignesCommande.reduce((total, ligne) => {
      return total + (ligne.prix_unitaire * ligne.quantite || 0);
    }, 0);

    return res.status(200).json({
      ...panier.toObject(),
      prixTotal,
      nombreArticles: lignesCommande.length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Valider le panier (transformer en commande)
const validerPanier = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  try {
    // Chercher le panier actif
    const panier = await Commande.findOne({
      user: req.user.id,
      status: true,
    }).populate({
      path: "lignesCommande",
      populate: [
        { path: "voiture", populate: "model_porsche_actuel" },
        { path: "accessoire" },
      ],
    });

    if (!panier) {
      return res.status(404).json({ message: "Aucun panier trouvé" });
    }

    // Vérifier qu'il y a des articles
    if (!panier.lignesCommande || panier.lignesCommande.length === 0) {
      return res.status(400).json({ message: "Le panier est vide" });
    }

    // Calculer le prix total
    const prixTotal = panier.lignesCommande.reduce((total, ligne) => {
      return total + (ligne.prix_unitaire * ligne.quantite || 0);
    }, 0);

    // Mettre à jour le panier
    panier.status = false; // Passer en commande validée
    panier.prix = prixTotal;
    panier.date_commande = new Date();

    await panier.save();

    // Retourner la commande validée
    const commandeValidee = await Commande.findById(panier._id)
      .populate("user", "name email")
      .populate({
        path: "lignesCommande",
        populate: [
          { path: "voiture", populate: "model_porsche_actuel" },
          { path: "accessoire" },
        ],
      });

    return res.status(200).json({
      message: "Commande validée avec succès",
      commande: commandeValidee,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Statistiques de commandes pour l'utilisateur
const getMesStatistiques = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  try {
    const commandes = await Commande.find({
      user: req.user.id,
      status: false, // Commandes validées uniquement
    }).populate({
      path: "lignesCommande",
    });

    const stats = {
      nombreCommandes: commandes.length,
      montantTotal: commandes.reduce(
        (total, cmd) => total + (cmd.prix || 0),
        0
      ),
      acompteTotal: commandes.reduce(
        (total, cmd) => total + (cmd.acompte || 0),
        0
      ),
      derniereCommande:
        commandes.length > 0 ? commandes[0].date_commande : null,
      commandesMoyenne:
        commandes.length > 0
          ? commandes.reduce((total, cmd) => total + (cmd.prix || 0), 0) /
            commandes.length
          : 0,
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
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
  getMesStatistiques,
};
