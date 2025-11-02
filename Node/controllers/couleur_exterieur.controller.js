import Couleur_exterieur from "../models/couleur_exterieur.model.js";
import couleur_exterieurValidation from "../validations/couleur_exterieur.validation.js";

const createCouleur_exterieur = async (req, res) => {
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
    const { error } = couleur_exterieurValidation(body).couleur_exterieurCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const couleur_exterieur = new Couleur_exterieur(body);
    const newCouleur_exterieur = await couleur_exterieur.save();
    return res.status(201).json({
      message: "Couleur extérieure créée avec succès",
      couleur: newCouleur_exterieur,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllCouleur_exterieurs = async (req, res) => {
  try {
    const couleur_exterieurs = await Couleur_exterieur.find().sort({
      nom_couleur: 1,
    });
    return res.status(200).json(couleur_exterieurs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getCouleur_exterieurById = async (req, res) => {
  try {
    const couleur_exterieur = await Couleur_exterieur.findById(req.params.id);
    if (!couleur_exterieur) {
      return res
        .status(404)
        .json({ message: "Couleur extérieure n'existe pas" });
    }
    return res.status(200).json(couleur_exterieur);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const updateCouleur_exterieur = async (req, res) => {
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

    const { error } = couleur_exterieurValidation(body).couleur_exterieurUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const updatedCouleur_exterieur = await Couleur_exterieur.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );
    if (!updatedCouleur_exterieur) {
      return res
        .status(404)
        .json({ message: "Couleur extérieure n'existe pas" });
    }
    return res.status(200).json({
      message: "Couleur extérieure mise à jour avec succès",
      couleur: updatedCouleur_exterieur,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteCouleur_exterieur = async (req, res) => {
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

    const couleur_exterieur = await Couleur_exterieur.findByIdAndDelete(
      req.params.id
    );
    if (!couleur_exterieur) {
      return res
        .status(404)
        .json({ message: "Couleur extérieure n'existe pas" });
    }
    return res
      .status(200)
      .json({ message: "Couleur extérieure supprimée avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export {
  createCouleur_exterieur,
  getAllCouleur_exterieurs,
  getCouleur_exterieurById,
  updateCouleur_exterieur,
  deleteCouleur_exterieur,
};
