import Accesoire from "../models/accesoire.model.js";
import accesoireValidation from "../validations/accesoire.validation.js";
import PhotoAccesoire from "../models/photo_accesoire.model.js";
import Couleur_accesoire from "../models/couleur_accesoire.model.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils/responses.js";

const createAccesoire = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const { error } = accesoireValidation(body).accesoireCreate;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }

    // Vérifier que la couleur existe si fournie
    if (body.couleur_accesoire) {
      const couleur = await Couleur_accesoire.findById(body.couleur_accesoire);
      if (!couleur) {
        return sendNotFound(res, "Couleur d'accessoire introuvable");
      }
    }

    // Vérifier que les photos existent si fournies
    if (body.photo_accesoire && Array.isArray(body.photo_accesoire)) {
      for (let photoId of body.photo_accesoire) {
        const photo = await PhotoAccesoire.findById(photoId);
        if (!photo) {
          return sendNotFound(res, `Photo ${photoId} introuvable`);
        }
      }
    }

    const accesoire = new Accesoire(body);
    const newAccesoire = await accesoire.save();

    const populatedAccesoire = await Accesoire.findById(newAccesoire._id)
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur");

    return sendSuccess(
      res,
      { accessoire: populatedAccesoire },
      "Accessoire créé avec succès",
      201
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

const getAllAccesoires = async (req, res) => {
  try {
    const accesoires = await Accesoire.find()
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur")
      .sort({ createdAt: -1 })
      .lean(); // Retourne des objets JS purs (30-50% plus rapide)

    return sendSuccess(res, accesoires);
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

const getAccesoireById = async (req, res) => {
  try {
    const accesoire = await Accesoire.findById(req.params.id)
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur description")
      .lean(); // Retourne un objet JS pur

    if (!accesoire) {
      return sendNotFound(res, "Accessoire introuvable");
    }

    return sendSuccess(res, accesoire);
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

const updateAccesoire = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const { error } = accesoireValidation(body).accesoireUpdate;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }

    const accesoireExist = await Accesoire.findById(req.params.id);
    if (!accesoireExist) {
      return sendNotFound(res, "Accessoire introuvable");
    }

    // Vérifier que la couleur existe si fournie
    if (body.couleur_accesoire) {
      const couleur = await Couleur_accesoire.findById(body.couleur_accesoire);
      if (!couleur) {
        return sendNotFound(res, "Couleur d'accessoire introuvable");
      }
    }

    const updatedAccesoire = await Accesoire.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    )
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur");

    return sendSuccess(
      res,
      { accessoire: updatedAccesoire },
      "Accessoire mis à jour avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

const deleteAccesoire = async (req, res) => {
  try {
    const accesoire = await Accesoire.findByIdAndDelete(req.params.id);
    if (!accesoire) {
      return sendNotFound(res, "Accessoire introuvable");
    }

    return sendSuccess(res, null, "Accessoire supprimé avec succès");
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

const addImages = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const { error } = accesoireValidation(body).accessoireAddOrRemoveImage;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }

    const accesoire = await Accesoire.findById(req.params.id);
    if (!accesoire) {
      return sendNotFound(res, `Accessoire ${req.params.id} introuvable`);
    }

    // Vérifier que toutes les photos existent
    for (let photo_accesoireId of body.photo_accesoire) {
      const photo_accesoire = await PhotoAccesoire.findById(photo_accesoireId);
      if (!photo_accesoire) {
        return sendNotFound(res, `Photo ${photo_accesoireId} introuvable`);
      }
    }

    // $addToSet évite les doublons
    const updatedAccesoire = await Accesoire.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { photo_accesoire: { $each: body.photo_accesoire } } },
      { new: true }
    )
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur");

    return sendSuccess(
      res,
      { accessoire: updatedAccesoire },
      "Photos ajoutées avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

const removeImages = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const { error } = accesoireValidation(body).accessoireAddOrRemoveImage;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }

    const accesoire = await Accesoire.findById(req.params.id);
    if (!accesoire) {
      return sendNotFound(res, `Accessoire ${req.params.id} introuvable`);
    }

    // Vérifier que toutes les photos existent
    for (let photo_accesoireId of body.photo_accesoire) {
      const photo_accesoire = await PhotoAccesoire.findById(photo_accesoireId);
      if (!photo_accesoire) {
        return sendNotFound(res, `Photo ${photo_accesoireId} introuvable`);
      }
    }

    const updatedAccesoire = await Accesoire.findByIdAndUpdate(
      req.params.id,
      { $pull: { photo_accesoire: { $in: body.photo_accesoire } } },
      { new: true }
    )
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur");

    return sendSuccess(
      res,
      { accessoire: updatedAccesoire },
      "Photos supprimées avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", error);
  }
};

const setCouleur = async (req, res) => {
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

    const { error } = accesoireValidation(body).accessoireSetCouleur;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Vérifier que l'accessoire existe
    const accesoire = await Accesoire.findById(req.params.id);
    if (!accesoire) {
      return res.status(404).json({ message: "Accessoire n'existe pas" });
    }

    // Vérifier que la couleur existe
    const couleur = await Couleur_accesoire.findById(body.couleur_accesoire);
    if (!couleur) {
      return res
        .status(404)
        .json({ message: "Couleur d'accessoire introuvable" });
    }

    // Mettre à jour la couleur
    const updatedAccesoire = await Accesoire.findByIdAndUpdate(
      req.params.id,
      { couleur_accesoire: body.couleur_accesoire },
      { new: true }
    )
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur description");

    return res.status(200).json({
      message: "Couleur définie avec succès",
      accessoire: updatedAccesoire,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const removeCouleur = async (req, res) => {
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

    // Vérifier que l'accessoire existe
    const accesoire = await Accesoire.findById(req.params.id);
    if (!accesoire) {
      return res.status(404).json({ message: "Accessoire n'existe pas" });
    }

    // Retirer la couleur
    const updatedAccesoire = await Accesoire.findByIdAndUpdate(
      req.params.id,
      { $unset: { couleur_accesoire: "" } },
      { new: true }
    ).populate("photo_accesoire", "name alt");

    return res.status(200).json({
      message: "Couleur supprimée avec succès",
      accessoire: updatedAccesoire,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAccessoiresByCriteria = async (req, res) => {
  try {
    const { type_accesoire, couleur_accesoire, prix_min, prix_max } = req.query;

    let query = {};

    if (type_accesoire) query.type_accesoire = type_accesoire;
    if (couleur_accesoire) query.couleur_accesoire = couleur_accesoire;
    if (prix_min || prix_max) {
      query.prix = {};
      if (prix_min) query.prix.$gte = Number(prix_min);
      if (prix_max) query.prix.$lte = Number(prix_max);
    }

    const accesoires = await Accesoire.find(query)
      .populate("photo_accesoire", "name alt")
      .populate("couleur_accesoire", "nom_couleur photo_couleur")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: accesoires.length,
      filters: query,
      accesoires,
    });
  } catch (error) {
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
  setCouleur,
  removeCouleur,
  getAccessoiresByCriteria,
};
