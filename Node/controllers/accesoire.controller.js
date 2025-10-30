import Accesoire from "../models/accesoire.model.js";
import accesoireValidation from "../validations/accesoire.validation.js";

const createAccesoire = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    const { error } = accesoireValidation(body).accesoireCreate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }
    const accesoire = new Accesoire(body);
    const newAccesoire = await accesoire.save();
    return res.status(201).json(newAccesoire);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllAccesoires = async (req, res) => {
  try {
    const accesoires = await Accesoire.find();
    return res.status(200).json(accesoires);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAccesoireById = async (req, res) => {
  try {
    const accesoire = await Accesoire.findById(req.params.id);
    if (!accesoire) {
      return res.status(404).json({ message: "accessoire n'existe pas" });
    }
    return res.status(200).json(accesoire);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const updateAccesoire = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = accesoireValidation(body).accesoireUpdate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }
    const updatedAccesoire = await Accesoire.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );
    if (!updatedAccesoire) {
      return res.status(404).json({ message: "accessoire n'existe pas" });
    }
    return res.status(200).json(updatedAccesoire);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteAccesoire = async (req, res) => {
  try {
    const accesoire = await Accesoire.findByIdAndDelete(req.params.id);
    if (!accesoire) {
      return res.status(404).json({ message: "accessoire n'existe pas" });
    }
    return res.status(200).json({ message: "accesoire a été supprimé" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export {
  createAccesoire,
  getAllAccesoires,
  getAccesoireById,
  updateAccesoire,
  deleteAccesoire,
};
