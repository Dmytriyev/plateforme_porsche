import Couleur_interieur from "../models/couleur_interieur.model.js";
import couleur_interieurValidation from "../validations/couleur_interieur.validation.js";

const createCouleur_interieur = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    const { error } = couleur_interieurValidation(body).couleur_interieurCreate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }
    const couleur_interieur = new Couleur_interieur(body);
    const newCouleur_interieur = await couleur_interieur.save();
    return res.status(201).json(newCouleur_interieur);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllCouleur_interieurs = async (req, res) => {
  try {
    const couleur_interieurs = await Couleur_interieur.find();
    return res.status(200).json(couleur_interieurs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getCouleur_interieurById = async (req, res) => {
  try {
    const couleur_interieur = await Couleur_interieur.findById(req.params.id);
    if (!couleur_interieur) {
      return res.status(404).json({ message: "couleur n'existe pas" });
    }
    return res.status(200).json(couleur_interieur);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const updateCouleur_interieur = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = couleur_interieurValidation(body).couleur_interieurUpdate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }
    const updatedCouleur_interieur = await Couleur_interieur.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );
    if (!updatedCouleur_interieur) {
      return res.status(404).json({ message: "couleur n'existe pas" });
    }
    return res.status(200).json(updatedCouleur_interieur);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteCouleur_interieur = async (req, res) => {
  try {
    const couleur_interieur = await Couleur_interieur.findByIdAndDelete(
      req.params.id
    );
    if (!couleur_interieur) {
      return res.status(404).json({ message: "couleur n'existe pas" });
    }
    return res
      .status(200)
      .json({ message: "couleur_interieur a été supprimé" });
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
