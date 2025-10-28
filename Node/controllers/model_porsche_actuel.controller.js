import Model_porsche_actuel from "../models/model_porsche_actuel.model.js";
import model_porsche_actuelValidation from "../validations/model_porsche_actuel.validation.js";
import Photo from "../models/photo_voiture_actuel.model.js";

const createModel_porsche_actuel = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    const { error } =
      model_porsche_actuelValidation(body).model_porsche_actuelCreate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }
    const model_porsche_actuel = new Model_porsche_actuel(body);
    const newModel_porsche_actuel = await model_porsche_actuel.save();
    return res.status(201).json(newModel_porsche_actuel);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllModel_porsche_actuels = async (req, res) => {
  try {
    const model_porsche_actuels = await Model_porsche_actuel.find()
      .populate("photo_voiture_actuel", "name alt")
      .populate("couleur_exterieur", "nom_couleur")
      .populate("couleur_interieur", "nom_couleur")
      .populate("user", "nom email");
    return res.status(200).json(model_porsche_actuels);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getModel_porsche_actuelById = async (req, res) => {
  try {
    const model_porsche_actuel = await Model_porsche_actuel.findById(
      req.params.id
    )
      .populate("photo_voiture_actuel", "name alt")
      .populate("couleur_exterieur", "nom_couleur")
      .populate("couleur_interieur", "nom_couleur")
      .populate("user", "nom email");
    if (!model_porsche_actuel) {
      return res
        .status(404)
        .json({ message: "model_porsche_actuel n'existe pas" });
    }
    return res.status(200).json(model_porsche_actuel);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const updateModel_porsche_actuel = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } =
      model_porsche_actuelValidation(body).model_porsche_actuelUpdate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }
    const updatedModel_porsche_actuel =
      await Model_porsche_actuel.findByIdAndUpdate(req.params.id, body, {
        new: true,
      })
        .populate("photo_voiture_actuel", "name alt")
        .populate("couleur_exterieur", "nom_couleur")
        .populate("couleur_interieur", "nom_couleur");
    if (!updatedModel_porsche_actuel) {
      return res
        .status(404)
        .json({ message: "model_porsche_actuel n'existe pas" });
    }
    return res.status(200).json(updatedModel_porsche_actuel);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteModel_porsche_actuel = async (req, res) => {
  try {
    const model_porsche_actuel = await Model_porsche_actuel.findByIdAndDelete(
      req.params.id
    );
    if (!model_porsche_actuel) {
      return res
        .status(404)
        .json({ message: "model_porsche_actuel n'existe pas" });
    }
    return res
      .status(200)
      .json({ message: "model_porsche_actuel à bien été supprimé" });
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

    const { error } =
      model_porsche_actuelValidation(body).model_porsche_actuelAddOrRemoveImage;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }

    for (let photo_voiture_actuelId of body.photo_voiture_actuels) {
      const photo_voiture_actuel = await Photo.findById(photo_voiture_actuelId);
      if (!photo_voiture_actuel) {
        return res
          .status(404)
          .json({ message: `la photo ${photo_voiture_actuelId} n'existe pas` });
      }
    }

    const model_porsche_actuel = await Model_porsche_actuel.findById(
      req.params.id
    );
    if (!model_porsche_actuel) {
      return res
        .status(404)
        .json({ message: `le modèle ${req.params.id} n'existe pas` });
    }

    // ajouter les photos sans doublons
    const updatedModel_porsche_actuel =
      await Model_porsche_actuel.findByIdAndUpdate(
        req.params.id,
        {
          $addToSet: {
            photo_voiture_actuel: { $each: body.photo_voiture_actuels },
          },
        },
        { new: true }
      ).populate("photo_voiture_actuel", "name alt");

    return res.status(200).json(updatedModel_porsche_actuel);
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
    const { error } =
      model_porsche_actuelValidation(body).model_porsche_actuelAddOrRemoveImage;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }

    for (let photo_voiture_actuelId of body.photo_voiture_actuels) {
      const photo_voiture_actuel = await Photo.findById(photo_voiture_actuelId);
      if (!photo_voiture_actuel) {
        return res
          .status(404)
          .json({ message: `la photo ${photo_voiture_actuelId} n'existe pas` });
      }
    }

    const model_porsche_actuel = await Model_porsche_actuel.findById(
      req.params.id
    );
    if (!model_porsche_actuel) {
      return res
        .status(404)
        .json({ message: `le modèle ${req.params.id} n'existe pas` });
    }

    const updatedModel_porsche_actuel =
      await Model_porsche_actuel.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { photo_voiture_actuel: { $in: body.photo_voiture_actuels } },
        },
        { new: true }
      ).populate("photo_voiture_actuel", "name alt");

    return res.status(200).json(updatedModel_porsche_actuel);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export {
  createModel_porsche_actuel,
  getAllModel_porsche_actuels,
  getModel_porsche_actuelById,
  updateModel_porsche_actuel,
  deleteModel_porsche_actuel,
  addImages,
  removeImages,
};
