import Commande from "../models/Commande.model.js";
import commandeValidation from "../validations/Commande.validation.js";
import LigneCommande from "../models/ligneCommande.model.js";

const createCommande = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    const { error } = commandeValidation(body).CommandeCreate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }
    const commande = new Commande(body);
    const newCommande = await commande.save();
    return res.status(201).json(newCommande);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find();
    return res.status(200).json(commandes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getCommandeById = async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: "commande n'existe pas" });
    }
    const ligneCommandes = await LigneCommande.find({
      commande: req.params.id,
    })
      .populate("accesoire", "prix nom_accesoire")
      .populate("voiture", "prix nom_model");
    const total = ligneCommandes.reduce((sum, line) => {
      return (
        sum + line.voiture.prix * line.quantite ||
        line.accesoire.prix * line.quantite
      );
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
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = commandeValidation(body).CommandeUpdate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }
    const updatedCommande = await Commande.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );
    if (!updatedCommande) {
      return res.status(404).json({ message: "commande n'existe pas" });
    }
    return res.status(200).json(updatedCommande);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteCommande = async (req, res) => {
  try {
    const commande = await Commande.findByIdAndDelete(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: "commande n'existe pas" });
    }
    return res.status(200).json({ message: "commande a été supprimé" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getPanier = async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: "erreur 404" });
  }
  try {
    const panier = await Commande.findOne({ user: req.user.id, status: true });
    if (!panier) {
      return res.status(404).json({ message: "panier n'existe pas" });
    }
    const ligneCommandes = await LigneCommande.find({
      commande: panier._id,
    })
      .populate("accesoire", "nom_accesoire prix")
      .populate("voiture", "nom_model prix");
    const total = ligneCommandes.reduce((sum, line) => {
      return (
        sum + line.accesoire.prix * line.quantite ||
        line.voiture.prix * line.quantite
      );
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
    return res.status(403).json({ message: "Vous n'êtes pas autorisé" });
  }
  try {
    const historique = await Commande.find({
      user: req.user.id,
      status: false,
    });
    return res.status(200).json(historique);
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
};
