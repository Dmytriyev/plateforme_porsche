import Taille_jante from "../models/taille_jante.model.js";
import taille_janteValidation from "../validations/taille_jante.validation.js";

const createTaille_jante = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    const { error } = taille_janteValidation(body).taille_janteCreate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }
    const taille_jante = new Taille_jante(body);
    const newTaille_jante = await taille_jante.save();
    return res.status(201).json(newTaille_jante);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllTaille_jantes = async (req, res) => {
  try {
    const taille_jantes = await Taille_jante.find();
    return res.status(200).json(taille_jantes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getTaille_janteById = async (req, res) => {
  try {
    const taille_jante = await Taille_jante.findById(req.params.id);
    if (!taille_jante) {
      return res.status(404).json({ message: "taille de jante n'existe pas" });
    }
    return res.status(200).json(taille_jante);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const updateTaille_jante = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = taille_janteValidation(body).taille_janteUpdate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }
    const updatedTaille_jante = await Taille_jante.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );
    if (!updatedTaille_jante) {
      return res.status(404).json({ message: "taille de jante n'existe pas" });
    }
    return res.status(200).json(updatedTaille_jante);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteTaille_jante = async (req, res) => {
  try {
    const taille_jante = await Taille_jante.findByIdAndDelete(req.params.id);
    if (!taille_jante) {
      return res.status(404).json({ message: "taille de jante n'existe pas" });
    }
    return res.status(200).json({ message: "taille_jante a été supprimé" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export {
  createTaille_jante,
  getAllTaille_jantes,
  getTaille_janteById,
  updateTaille_jante,
  deleteTaille_jante,
};
