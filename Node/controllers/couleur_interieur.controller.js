import Couleur_interieur from "../models/couleur_interieur.model.js";
import couleur_interieurValidation from "../validations/couleur_interieur.validation.js";

const createCouleur_interieur = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    // Vérifier que l'utilisateur est admin
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Accès réservé aux administrateurs" });
    }

    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    const { error } = couleur_interieurValidation(body).couleur_interieurCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const couleur_interieur = new Couleur_interieur(body);
    const newCouleur_interieur = await couleur_interieur.save();

    // Retourner avec populate
    const populatedCouleur = await Couleur_interieur.findById(
      newCouleur_interieur._id
    ).populate("model_porsche", "nom_model prix");

    return res.status(201).json({
      message: "Couleur intérieure créée avec succès",
      couleur: populatedCouleur,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllCouleur_interieurs = async (req, res) => {
  try {
    const couleur_interieurs = await Couleur_interieur.find()
      .populate("model_porsche", "nom_model prix")
      .sort({ nom_couleur: 1 });
    return res.status(200).json(couleur_interieurs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getCouleur_interieurById = async (req, res) => {
  try {
    const couleur_interieur = await Couleur_interieur.findById(
      req.params.id
    ).populate("model_porsche", "nom_model prix description");
    if (!couleur_interieur) {
      return res
        .status(404)
        .json({ message: "Couleur intérieure n'existe pas" });
    }
    return res.status(200).json(couleur_interieur);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const updateCouleur_interieur = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    // Vérifier que l'utilisateur est admin
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Accès réservé aux administrateurs" });
    }

    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = couleur_interieurValidation(body).couleur_interieurUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const updatedCouleur_interieur = await Couleur_interieur.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    ).populate("model_porsche", "nom_model prix");
    if (!updatedCouleur_interieur) {
      return res
        .status(404)
        .json({ message: "Couleur intérieure n'existe pas" });
    }
    return res.status(200).json({
      message: "Couleur intérieure mise à jour avec succès",
      couleur: updatedCouleur_interieur,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteCouleur_interieur = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    // Vérifier que l'utilisateur est admin
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Accès réservé aux administrateurs" });
    }

    const couleur_interieur = await Couleur_interieur.findByIdAndDelete(
      req.params.id
    );
    if (!couleur_interieur) {
      return res
        .status(404)
        .json({ message: "Couleur intérieure n'existe pas" });
    }
    return res
      .status(200)
      .json({ message: "Couleur intérieure supprimée avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export {
  createCouleur_interieur,
  getAllCouleur_interieurs,
  getCouleur_interieurById,
  updateCouleur_interieur,
  deleteCouleur_interieur,
};
