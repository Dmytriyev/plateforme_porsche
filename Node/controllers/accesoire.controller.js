import Accesoire from "../models/accesoire.model.js";
import accesoireValidation from "../validations/accesoire.validation.js";
import PhotoAccesoire from "../models/photo_accesoire.model.js";

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
    const accesoires = await Accesoire.find()
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur");
    return res.status(200).json(accesoires);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAccesoireById = async (req, res) => {
  try {
    const accesoire = await Accesoire.findById(req.params.id)
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur");
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

const addImages = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = accesoireValidation(body).accessoireAddOrRemoveImage;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }

    for (let photo_accesoireId of body.photo_accesoire) {
      const photo_accesoire = await PhotoAccesoire.findById(photo_accesoireId);
      if (!photo_accesoire) {
        return res
          .status(404)
          .json({ message: `la photo ${photo_accesoireId} n'existe pas` });
      }
    }

    const accesoire = await Accesoire.findById(req.params.id);
    if (!accesoire) {
      return res
        .status(404)
        .json({ message: `l'accessoire ${req.params.id} n'existe pas` });
    }

    // Utiliser $addToSet pour ajouter les photos sans doublons
    const updatedAccesoire = await Accesoire.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { photo_accesoire: { $each: body.photo_accesoire } } },
      { new: true }
    );

    return res.status(200).json(updatedAccesoire);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const removeImages = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = accesoireValidation(body).accessoireAddOrRemoveImage;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }

    for (let photo_accesoireId of body.photo_accesoire) {
      const photo_accesoire = await PhotoAccesoire.findById(photo_accesoireId);
      if (!photo_accesoire) {
        return res
          .status(404)
          .json({ message: `la photo ${photo_accesoireId} n'existe pas` });
      }
    }

    const accesoire = await Accesoire.findById(req.params.id);
    if (!accesoire) {
      return res
        .status(404)
        .json({ message: `l'accessoire ${req.params.id} n'existe pas` });
    }

    const updatedAccesoire = await Accesoire.findByIdAndUpdate(
      req.params.id,
      { $pull: { photo_accesoire: { $in: body.photo_accesoire } } },
      { new: true }
    );
    return res.status(200).json(updatedAccesoire);
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
  addImages,
  removeImages,
};
