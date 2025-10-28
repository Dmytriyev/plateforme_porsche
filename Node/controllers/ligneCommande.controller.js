import LigneCommande from "../models/ligneCommande.model.js";
import Commande from "../models/Commande.model.js";
import ligneCommandeValidation from "../validations/ligneCommande.validation.js";

const createLigneCommande = async (req, res) => {
  try {
    const { body, user } = req;

    const commande = await Commande.findOne({ user: user.id, status: true });
    console.log(body);

    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const line = { ...body, commande: commande._id.toString() };
    console.log(line);

    const { error } = ligneCommandeValidation(line).ligneCommandeCreate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }

    const ligneCommande = new LigneCommande(line);
    const newLigneCommande = await ligneCommande.save();

    return res.status(201).json(newLigneCommande);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllLigneCommandes = async (req, res) => {
  try {
    const ligneCommandes = await LigneCommande.find();
    return res.status(200).json(ligneCommandes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getLigneCommandeById = async (req, res) => {
  try {
    const ligneCommande = await LigneCommande.findById(req.params.id);

    if (!ligneCommande) {
      return res.status(404).json({ message: "ligneCommande n'existe pas" });
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

    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = ligneCommandeValidation(body).ligneCommandeUpdate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }

    const updatedLigneCommande = await LigneCommande.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );

    if (!updatedLigneCommande) {
      return res.status(404).json({ message: "ligneCommande n'existe pas" });
    }

    return res.status(200).json(updatedLigneCommande);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteLigneCommande = async (req, res) => {
  try {
    const ligneCommande = await LigneCommande.findByIdAndDelete(req.params.id);

    if (!ligneCommande) {
      return res.status(404).json({ message: "ligneCommande n'existe pas" });
    }

    return res.status(200).json({ message: "ligneCommande a été supprimé" });
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
};
