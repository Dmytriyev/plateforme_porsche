import Voiture from "../models/voiture.model.js";
import voitureValidation from "../validations/voiture.validation.js";
import Photo from "../models/photo_voiture.model.js";

const createVoiture = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    const { error } = voitureValidation(body).voitureCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const voiture = new Voiture(body);
    const newVoiture = await voiture.save();

    const populatedVoiture = await Voiture.findById(newVoiture._id).populate(
      "photo_voiture",
      "name alt"
    );
    return res.status(201).json(populatedVoiture);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllVoitures = async (req, res) => {
  try {
    const voitures = await Voiture.find()
      .populate("photo_voiture", "name alt")
      .sort({ createdAt: -1 });
    return res.status(200).json(voitures);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getVoitureById = async (req, res) => {
  try {
    const voiture = await Voiture.findById(req.params.id).populate(
      "photo_voiture",
      "name alt"
    );
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
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = voitureValidation(body).voitureUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

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
    ).populate("photo_voiture", "name alt");

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
    return res
      .status(200)
      .json({ message: "voiture a été supprimée avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const addImages = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = voitureValidation(body).voitureAddOrRemoveImage;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Vérifier que les photos existent
    for (let photo_voitureId of body.photo_voiture) {
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

    // Utiliser $addToSet pour ajouter les photos sans doublons
    const updatedVoiture = await Voiture.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { photo_voiture: { $each: body.photo_voiture } } },
      { new: true }
    ).populate("photo_voiture", "name alt");

    return res.status(200).json(updatedVoiture);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const removeImages = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = voitureValidation(body).voitureAddOrRemoveImage;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Vérifier que les photos existent
    for (let photo_voitureId of body.photo_voiture) {
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

    const updatedVoiture = await Voiture.findByIdAndUpdate(
      req.params.id,
      { $pull: { photo_voiture: { $in: body.photo_voiture } } },
      { new: true }
    ).populate("photo_voiture", "name alt");

    return res.status(200).json(updatedVoiture);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Récupérer tous les modèles Porsche associés à une voiture
const getModelsPorscheByVoiture = async (req, res) => {
  try {
    const voiture = await Voiture.findById(req.params.id);
    if (!voiture) {
      return res.status(404).json({ message: "voiture n'existe pas" });
    }

    // Importer dynamiquement pour éviter les dépendances circulaires
    const Model_porsche = (await import("../models/model_porsche.model.js"))
      .default;

    const models_porsche = await Model_porsche.find({ voiture: req.params.id })
      .populate("photo_porsche", "name alt")
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante")
      .sort({ annee_production: -1 });

    return res.status(200).json({
      voiture: {
        _id: voiture._id,
        nom_model: voiture.nom_model,
        type_voiture: voiture.type_voiture,
        description: voiture.description,
        prix: voiture.prix,
      },
      models_porsche,
      count: models_porsche.length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Statistiques d'une voiture (nombre de modèles, photos, etc.)
const getVoitureStats = async (req, res) => {
  try {
    const voiture = await Voiture.findById(req.params.id).populate(
      "photo_voiture",
      "name alt"
    );
    if (!voiture) {
      return res.status(404).json({ message: "voiture n'existe pas" });
    }

    const Model_porsche = (await import("../models/model_porsche.model.js"))
      .default;

    const models_porsche = await Model_porsche.find({
      voiture: req.params.id,
    });

    const stats = {
      voiture: {
        _id: voiture._id,
        nom_model: voiture.nom_model,
        type_voiture: voiture.type_voiture,
        description: voiture.description,
        prix: voiture.prix,
      },
      nombre_photos: voiture.photo_voiture.length,
      nombre_models_porsche: models_porsche.length,
      prix_min_models:
        models_porsche.length > 0
          ? Math.min(...models_porsche.map((m) => m.prix || 0))
          : 0,
      prix_max_models:
        models_porsche.length > 0
          ? Math.max(...models_porsche.map((m) => m.prix || 0))
          : 0,
      photos: voiture.photo_voiture,
    };

    return res.status(200).json(stats);
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
  getModelsPorscheByVoiture,
  getVoitureStats,
};
