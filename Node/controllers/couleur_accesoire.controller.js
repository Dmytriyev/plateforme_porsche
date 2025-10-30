import Couleur_accesoire from "../models/couleur_accesoire.model.js";
import couleur_accesoireValidation from "../validations/couleur_accesoire.validation.js";

const createCouleur_accesoire = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    const { error } = couleur_accesoireValidation(body).couleur_accesoireCreate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }
    const couleur_accesoire = new Couleur_accesoire(body);
    const newCouleur_accesoire = await couleur_accesoire.save();
    return res.status(201).json(newCouleur_accesoire);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllCouleur_accesoires = async (req, res) => {
  try {
    const couleur_accesoires = await Couleur_accesoire.find();
    return res.status(200).json(couleur_accesoires);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getCouleur_accesoireById = async (req, res) => {
  try {
    const couleur_accesoire = await Couleur_accesoire.findById(req.params.id);
    if (!couleur_accesoire) {
      return res
        .status(404)
        .json({ message: "couleur_accessoire n'existe pas" });
    }
    return res.status(200).json(couleur_accesoire);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const updateCouleur_accesoire = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = couleur_accesoireValidation(body).couleur_accesoireUpdate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }
    const updatedCouleur_accesoire = await Couleur_accesoire.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );
    if (!updatedCouleur_accesoire) {
      return res
        .status(404)
        .json({ message: "couleur_accessoire n'existe pas" });
    }
    return res.status(200).json(updatedCouleur_accesoire);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteCouleur_accesoire = async (req, res) => {
  try {
    const couleur_accesoire = await Couleur_accesoire.findByIdAndDelete(
      req.params.id
    );
    if (!couleur_accesoire) {
      return res
        .status(404)
        .json({ message: "couleur_accessoire n'existe pas" });
    }
    return res
      .status(200)
      .json({ message: "couleur_accesoire a été supprimé" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export {
  createCouleur_accesoire,
  getAllCouleur_accesoires,
  getCouleur_accesoireById,
  updateCouleur_accesoire,
  deleteCouleur_accesoire,
};
