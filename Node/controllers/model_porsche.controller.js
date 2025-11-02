import Model_porsche from "../models/model_porsche.model.js";
import model_porscheValidation from "../validations/model_porsche.validation.js";

const createModel_porsche = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    const { error } = model_porscheValidation(body).model_porscheCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const model_porsche = new Model_porsche(body);
    const newModel_porsche = await model_porsche.save();
    return res.status(201).json(newModel_porsche);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllModel_porsches = async (req, res) => {
  try {
    const model_porsches = await Model_porsche.find()
      .populate("photo_porsche", "name alt")
      .populate("voiture", "nom_model type_voiture description prix")
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante")
      .sort({ annee_production: -1 });
    return res.status(200).json(model_porsches);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getModel_porscheById = async (req, res) => {
  try {
    const model_porsche = await Model_porsche.findById(req.params.id)
      .populate("photo_porsche", "name alt")
      .populate("voiture", "nom_model type_voiture description prix")
      .populate("couleur_exterieur", "nom_couleur photo_couleur description")
      .populate("couleur_interieur", "nom_couleur photo_couleur description")
      .populate("taille_jante", "taille_jante");
    if (!model_porsche) {
      return res.status(404).json({ message: "modèle Porsche n'existe pas" });
    }
    return res.status(200).json(model_porsche);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const updateModel_porsche = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = model_porscheValidation(body).model_porscheUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    )
      .populate("photo_porsche", "name alt")
      .populate("voiture", "nom_model type_voiture")
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante");
    if (!updatedModel_porsche) {
      return res.status(404).json({ message: "modèle Porsche n'existe pas" });
    }
    return res.status(200).json(updatedModel_porsche);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteModel_porsche = async (req, res) => {
  try {
    const model_porsche = await Model_porsche.findByIdAndDelete(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: "modèle Porsche n'existe pas" });
    }
    return res
      .status(200)
      .json({ message: "modèle Porsche a été supprimé avec succès" });
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

    const { error } =
      model_porscheValidation(body).model_porscheAddOrRemoveImage;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const model_porsche = await Model_porsche.findById(req.params.id);
    if (!model_porsche) {
      return res
        .status(404)
        .json({ message: `Le modèle ${req.params.id} n'existe pas` });
    }

    // Ajouter les photos sans doublons
    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { photo_porsche: { $each: body.photo_porsche } } },
      { new: true }
    ).populate("photo_porsche", "name alt");

    return res.status(200).json(updatedModel_porsche);
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

    const { error } =
      model_porscheValidation(body).model_porscheAddOrRemoveImage;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const model_porsche = await Model_porsche.findById(req.params.id);
    if (!model_porsche) {
      return res
        .status(404)
        .json({ message: `Le modèle ${req.params.id} n'existe pas` });
    }

    // Retirer les photos
    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      { $pull: { photo_porsche: { $in: body.photo_porsche } } },
      { new: true }
    ).populate("photo_porsche", "name alt");

    return res.status(200).json(updatedModel_porsche);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Gestion couleur extérieure
const addCouleurExterieur = async (req, res) => {
  try {
    const { couleur_exterieur } = req.body;
    if (!couleur_exterieur) {
      return res.status(400).json({ message: "couleur_exterieur est requis" });
    }

    const model_porsche = await Model_porsche.findById(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: "modèle Porsche n'existe pas" });
    }

    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      { couleur_exterieur },
      { new: true }
    )
      .populate("couleur_exterieur", "nom_couleur photo_couleur description")
      .populate("voiture", "nom_model type_voiture");

    return res.status(200).json(updatedModel_porsche);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const removeCouleurExterieur = async (req, res) => {
  try {
    const model_porsche = await Model_porsche.findById(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: "modèle Porsche n'existe pas" });
    }

    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      { $unset: { couleur_exterieur: "" } },
      { new: true }
    ).populate("voiture", "nom_model type_voiture");

    return res.status(200).json(updatedModel_porsche);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Gestion couleurs intérieures (Many-to-Many)
const addCouleursInterieur = async (req, res) => {
  try {
    const { couleur_interieur } = req.body;
    if (!couleur_interieur || !Array.isArray(couleur_interieur)) {
      return res.status(400).json({
        message: "couleur_interieur doit être un tableau d'IDs",
      });
    }

    const model_porsche = await Model_porsche.findById(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: "modèle Porsche n'existe pas" });
    }

    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { couleur_interieur: { $each: couleur_interieur } } },
      { new: true }
    )
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("voiture", "nom_model type_voiture");

    return res.status(200).json(updatedModel_porsche);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const removeCouleursInterieur = async (req, res) => {
  try {
    const { couleur_interieur } = req.body;
    if (!couleur_interieur || !Array.isArray(couleur_interieur)) {
      return res.status(400).json({
        message: "couleur_interieur doit être un tableau d'IDs",
      });
    }

    const model_porsche = await Model_porsche.findById(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: "modèle Porsche n'existe pas" });
    }

    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      { $pull: { couleur_interieur: { $in: couleur_interieur } } },
      { new: true }
    )
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("voiture", "nom_model type_voiture");

    return res.status(200).json(updatedModel_porsche);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Gestion taille de jante
const addTailleJante = async (req, res) => {
  try {
    const { taille_jante } = req.body;
    if (!taille_jante) {
      return res.status(400).json({ message: "taille_jante est requis" });
    }

    const model_porsche = await Model_porsche.findById(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: "modèle Porsche n'existe pas" });
    }

    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      { taille_jante },
      { new: true }
    )
      .populate("taille_jante", "taille_jante")
      .populate("voiture", "nom_model type_voiture");

    return res.status(200).json(updatedModel_porsche);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const removeTailleJante = async (req, res) => {
  try {
    const model_porsche = await Model_porsche.findById(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: "modèle Porsche n'existe pas" });
    }

    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      { $unset: { taille_jante: "" } },
      { new: true }
    ).populate("voiture", "nom_model type_voiture");

    return res.status(200).json(updatedModel_porsche);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export {
  createModel_porsche,
  getAllModel_porsches,
  getModel_porscheById,
  updateModel_porsche,
  deleteModel_porsche,
  addImages,
  removeImages,
  addCouleurExterieur,
  removeCouleurExterieur,
  addCouleursInterieur,
  removeCouleursInterieur,
  addTailleJante,
  removeTailleJante,
};
