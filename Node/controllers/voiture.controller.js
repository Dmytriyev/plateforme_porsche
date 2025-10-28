import Voiture from "../models/voiture.model.js";
import voitureValidation from "../validations/voiture.validation.js";
import Photo from "../models/photo_voiture.model.js";

const createVoiture = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    const { error } = voitureValidation(body).voitureCreate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }
    const voiture = new Voiture(body);
    const newVoiture = await voiture.save();
    return res.status(201).json(newVoiture);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllVoitures = async (req, res) => {
  try {
    const voitures = await Voiture.find()
      .populate("photo_voiture", "name")
      .populate("nom_model prix")
      .populate("model_porsche", "numero_win");
    return res.status(200).json(voitures);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getVoitureById = async (req, res) => {
  try {
    const voiture = await Voiture.findById(req.params.id)
      .populate("photo_voiture", "name")
      .populate("model_porsche", "type_model type_carrosserie");
    if (!voiture) {
      return res.status(404).json({ message: "voiture n'existe pas" });
    }
    return res.status(200).json(voiture);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const updateVoiture = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = voitureValidation(body).voitureUpdate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }

    // Séparer les photos des autres données
    const { photo_voiture, ...otherData } = body;

    let updateQuery = otherData;

    // Si des photos sont fournies, utiliser $addToSet pour éviter les doublons
    if (
      photo_voiture &&
      Array.isArray(photo_voiture) &&
      photo_voiture.length > 0
    ) {
      updateQuery = {
        ...otherData,
        $addToSet: { photo_voiture: { $each: photo_voiture } },
      };
    }

    const updatedVoiture = await Voiture.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      { new: true }
    );

    if (!updatedVoiture) {
      return res.status(404).json({ message: "voiture n'existe pas" });
    }
    return res.status(200).json(updatedVoiture);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteVoiture = async (req, res) => {
  try {
    const voiture = await Voiture.findByIdAndDelete(req.params.id);
    if (!voiture) {
      return res.status(404).json({ message: "voiture n'existe pas" });
    }
    return res.status(200).json({ message: "voiture a été supprimé" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const addImages = async (req, res) => {
  try {
    const { body } = req;
    if (!body || !body.photo_voitures) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Validation simple pour les photos
    if (!Array.isArray(body.photo_voitures)) {
      return res
        .status(400)
        .json({ message: "Le champ photo_voitures doit être un tableau" });
    }

    // Vérifier que toutes les photos existent
    for (let photo_voitureId of body.photo_voitures) {
      const photo_voiture = await Photo.findById(photo_voitureId);
      if (!photo_voiture) {
        return res
          .status(404)
          .json({ message: `la photo ${photo_voitureId} n'existe pas` });
      }
    }

    // Vérifier que la voiture existe
    const voiture = await Voiture.findById(req.params.id);
    if (!voiture) {
      return res
        .status(404)
        .json({ message: `la voiture ${req.params.id} n'existe pas` });
    }

    // Utiliser $addToSet pour ajouter les photos sans doublons
    const updatedVoiture = await Voiture.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { photo_voiture: { $each: body.photo_voitures } } },
      { new: true }
    );

    return res.status(200).json(updatedVoiture);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const removeImages = async (req, res) => {
  try {
    const { body } = req;
    if (!body || !body.photo_voitures) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = voitureValidation(body).voitureAddOrRemoveImage;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }

    for (let photo_voitureId of body.photo_voitures) {
      const photo_voiture = await Photo.findById(photo_voitureId);
      if (!photo_voiture) {
        return res
          .status(404)
          .json({ message: `la photo ${photo_voitureId} n'existe pas` });
      }
    }
    const voiture = await Voiture.findById(req.params.id);
    if (!voiture) {
      return res
        .status(404)
        .json({ message: `la voiture ${req.params.id} n'existe pas` });
    }
    console.log(voiture.photo_voiture);
    const updatedVoiture = await Voiture.findByIdAndUpdate(
      req.params.id,
      { $pull: { photo_voiture: { $in: body.photo_voitures } } },
      { new: true }
    );
    return res.status(200).json(updatedVoiture);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export {
  createVoiture,
  getAllVoitures,
  getVoitureById,
  updateVoiture,
  deleteVoiture,
  addImages,
  removeImages,
};
