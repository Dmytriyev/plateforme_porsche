import Model_porsche_actuel from "../models/model_porsche_actuel.model.js";
import model_porsche_actuelValidation from "../validations/model_porsche_actuel.validation.js";
import Photo from "../models/photo_voiture_actuel.model.js";
import Couleur_exterieur from "../models/couleur_exterieur.model.js";
import Couleur_interieur from "../models/couleur_interieur.model.js";
import Taille_jante from "../models/taille_jante.model.js";

// Créer un nouveau modèle_Porsche_actuel
const createModel_porsche_actuel = async (req, res) => {
  try {
    const { body } = req;
    // Vérifier l'accès authentifié
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }
    // Vérifier que le corps de la requête n'est pas vide
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    // Assigner l'utilisateur actuel comme propriétaire
    body.user = req.user.id;
    // Valider les données d'entrée avec Joi
    const { error } =
      model_porsche_actuelValidation(body).model_porsche_actuelCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Vérifier que les couleur_exterieur existent si fournies
    if (body.couleur_exterieur) {
      const couleurExt = await Couleur_exterieur.findById(
        body.couleur_exterieur
      );
      if (!couleurExt) {
        return res
          .status(404)
          .json({ message: "Couleur extérieure introuvable" });
      }
    }
    // Vérifier que les couleur_interieur existent si fournies
    if (body.couleur_interieur) {
      const couleurInt = await Couleur_interieur.findById(
        body.couleur_interieur
      );
      if (!couleurInt) {
        return res
          .status(404)
          .json({ message: "Couleur intérieure introuvable" });
      }
    }

    // Vérifier que les taille_jante existent si fournies
    if (body.taille_jante) {
      const jante = await Taille_jante.findById(body.taille_jante);
      if (!jante) {
        return res.status(404).json({ message: "Taille de jante introuvable" });
      }
    }

    // Créer et sauvegarder le nouveau modèle_Porsche_actuel dans la base de données
    const model_porsche_actuel = new Model_porsche_actuel(body);
    const newModel_porsche_actuel = await model_porsche_actuel.save();

    const populated = await Model_porsche_actuel.findById(
      newModel_porsche_actuel._id
    )
      .populate("photo_voiture_actuel", "name alt")
      .populate("couleur_exterieur", "nom_couleur")
      .populate("couleur_interieur", "nom_couleur")
      .populate("taille_jante", "taille_jante couleur_jante")
      .populate("user", "nom prenom email");

    return res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Récupérer tous les modèles_Porsche_actuels
const getAllModel_porsche_actuels = async (req, res) => {
  try {
    const model_porsche_actuels = await Model_porsche_actuel.find()
      .populate("photo_voiture_actuel", "name alt")
      .populate("couleur_exterieur", "nom_couleur")
      .populate("couleur_interieur", "nom_couleur")
      .populate("taille_jante", "taille_jante couleur_jante")
      .populate("user", "nom prenom email")
      .sort({ createdAt: -1 }) // Trier par date de création décroissante
      .lean(); // Retourne des objets JS purs
    return res.status(200).json(model_porsche_actuels);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Récupérer un modèle_Porsche_actuel par ID
const getModel_porsche_actuelById = async (req, res) => {
  try {
    const model_porsche_actuel = await Model_porsche_actuel.findById(
      req.params.id
    )
      .populate("photo_voiture_actuel", "name alt")
      .populate("couleur_exterieur", "nom_couleur")
      .populate("couleur_interieur", "nom_couleur")
      .populate("taille_jante", "taille_jante couleur_jante photo_couleur")
      .populate("user", "nom prenom email")
      .lean();
    if (!model_porsche_actuel) {
      return res
        .status(404)
        .json({ message: "Modèle Porsche actuel n'existe pas" });
    }
    return res.status(200).json(model_porsche_actuel);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Mettre à jour un modèle_Porsche_actuel par ID
const updateModel_porsche_actuel = async (req, res) => {
  try {
    const { body } = req;
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }
    // Vérifier que le corps de la requête n'est pas vide
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Vérifier que le modèle_porsche_actuel existe
    const existingModel = await Model_porsche_actuel.findById(req.params.id);
    if (!existingModel) {
      return res
        .status(404)
        .json({ message: "Modèle Porsche actuel n'existe pas" });
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    if (existingModel.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    // Empêcher la modification du champ user
    delete body.user;

    // photo_voiture_actuel est géré via /addImages et /deleteImages, pas via update
    if (body.photo_voiture_actuel) {
      delete body.photo_voiture_actuel;
    }

    // Valider les données d'entrée avec Joi
    const { error } =
      model_porsche_actuelValidation(body).model_porsche_actuelUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Vérifier que les nouvelles couleurs/jantes existent si fournies
    if (body.couleur_exterieur) {
      const couleurExt = await Couleur_exterieur.findById(
        body.couleur_exterieur
      );
      if (!couleurExt) {
        return res
          .status(404)
          .json({ message: "Couleur extérieure introuvable" });
      }
    }
    if (body.couleur_interieur) {
      const couleurInt = await Couleur_interieur.findById(
        body.couleur_interieur
      );
      if (!couleurInt) {
        return res
          .status(404)
          .json({ message: "Couleur intérieure introuvable" });
      }
    }
    if (body.taille_jante) {
      const jante = await Taille_jante.findById(body.taille_jante);
      if (!jante) {
        return res.status(404).json({ message: "Taille de jante introuvable" });
      }
    }

    // Mettre à jour le modèle_Porsche_actuel dans la base de données
    const updatedModel_porsche_actuel =
      await Model_porsche_actuel.findByIdAndUpdate(req.params.id, body, {
        new: true,
      })
        .populate("photo_voiture_actuel", "name alt")
        .populate("couleur_exterieur", "nom_couleur")
        .populate("couleur_interieur", "nom_couleur")
        .populate("taille_jante", "taille_jante couleur_jante");

    return res.status(200).json(updatedModel_porsche_actuel);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Supprimer un modèle_Porsche_actuel par ID
const deleteModel_porsche_actuel = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }
    // Vérifier que le modèle_porsche_actuel existe
    const model_porsche_actuel = await Model_porsche_actuel.findById(
      req.params.id
    );
    if (!model_porsche_actuel) {
      return res
        .status(404)
        .json({ message: "Modèle Porsche actuel n'existe pas" });
    }
    // Vérifier que l'utilisateur est propriétaire ou admin
    if (
      model_porsche_actuel.user.toString() !== req.user.id &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    // Supprimer le modèle_Porsche_actuel de la base de données
    await Model_porsche_actuel.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ message: "model_porsche_actuel à bien été supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Ajouter des images à un modèle_Porsche_actuel
const addImages = async (req, res) => {
  try {
    const { body } = req;
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    const { error } =
      model_porsche_actuelValidation(body).model_porsche_actuelAddOrRemoveImage;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // Vérifier que les photos existent dans la base de données
    for (let photo_voiture_actuelId of body.photo_voiture_actuel) {
      const photo_voiture_actuel = await Photo.findById(photo_voiture_actuelId);
      if (!photo_voiture_actuel) {
        return res
          .status(404)
          .json({ message: `Photo ${photo_voiture_actuelId} n'existe pas` });
      }
    }
    // Vérifier que le modèle_porsche_actuel existe
    const model_porsche_actuel = await Model_porsche_actuel.findById(
      req.params.id
    );
    if (!model_porsche_actuel) {
      return res
        .status(404)
        .json({ message: `Modèle ${req.params.id} n'existe pas` });
    }

    // Vérifier que l'utilisateur est propriétaire ou admin
    if (
      model_porsche_actuel.user.toString() !== req.user.id &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // ajouter les photos sans doublons avec $addToSet
    const updatedModel_porsche_actuel =
      await Model_porsche_actuel.findByIdAndUpdate(
        req.params.id,
        {
          $addToSet: {
            photo_voiture_actuel: { $each: body.photo_voiture_actuel },
          },
        },
        { new: true }
      )
        .populate("photo_voiture_actuel", "name alt")
        .populate("couleur_exterieur", "nom_couleur")
        .populate("couleur_interieur", "nom_couleur")
        .populate("taille_jante", "taille_jante couleur_jante");

    return res.status(200).json(updatedModel_porsche_actuel);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Retirer des images d'un modèle_Porsche_actuel
const removeImages = async (req, res) => {
  try {
    const { body } = req;
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }
    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    const { error } =
      model_porsche_actuelValidation(body).model_porsche_actuelAddOrRemoveImage;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // Vérifier que les photos existent dans la base de données
    for (let photo_voiture_actuelId of body.photo_voiture_actuel) {
      const photo_voiture_actuel = await Photo.findById(photo_voiture_actuelId);
      if (!photo_voiture_actuel) {
        return res
          .status(404)
          .json({ message: `Photo ${photo_voiture_actuelId} n'existe pas` });
      }
    }
    const model_porsche_actuel = await Model_porsche_actuel.findById(
      req.params.id
    );
    if (!model_porsche_actuel) {
      return res
        .status(404)
        .json({ message: `Modèle ${req.params.id} n'existe pas` });
    }
    // Vérifier que l'utilisateur est propriétaire ou admin
    if (
      model_porsche_actuel.user.toString() !== req.user.id &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    // Retirer les photos avec $pull
    const updatedModel_porsche_actuel =
      await Model_porsche_actuel.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { photo_voiture_actuel: { $in: body.photo_voiture_actuel } },
        },
        { new: true }
      )
        .populate("photo_voiture_actuel", "name alt")
        .populate("couleur_exterieur", "nom_couleur")
        .populate("couleur_interieur", "nom_couleur")
        .populate("taille_jante", "taille_jante couleur_jante");

    return res.status(200).json(updatedModel_porsche_actuel);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Récupérer les Porsches de l'utilisateur connecté
const getMesPorsches = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }
    const mesPorsches = await Model_porsche_actuel.find({ user: req.user.id })
      .populate("photo_voiture_actuel", "name alt")
      .populate("couleur_exterieur", "nom_couleur")
      .populate("couleur_interieur", "nom_couleur")
      .populate("taille_jante", "taille_jante couleur_jante photo_couleur")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      total: mesPorsches.length,
      porsches: mesPorsches,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Mettre à jour la couleur extérieure d'un modèle_Porsche_actuel
const setCouleurExterieur = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }
    const { couleur_exterieur } = req.body;
    if (!couleur_exterieur) {
      return res.status(400).json({ message: "couleur_exterieur est requis" });
    }

    const couleur = await Couleur_exterieur.findById(couleur_exterieur);
    if (!couleur) {
      return res
        .status(404)
        .json({ message: "Couleur extérieure introuvable" });
    }

    const model = await Model_porsche_actuel.findById(req.params.id);
    if (!model) {
      return res
        .status(404)
        .json({ message: "Modèle Porsche actuel n'existe pas" });
    }
    if (model.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    // Mettre à jour la couleur extérieure
    model.couleur_exterieur = couleur_exterieur;
    await model.save();
    // Récupérer le modèle mis à jour
    const updated = await Model_porsche_actuel.findById(model._id)
      .populate("photo_voiture_actuel", "name alt")
      .populate("couleur_exterieur", "nom_couleur")
      .populate("couleur_interieur", "nom_couleur")
      .populate("taille_jante", "taille_jante couleur_jante");
    return res.status(200).json({
      message: "Couleur extérieure mise à jour avec succès",
      porsche: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Mettre à jour la couleur intérieure d'un modèle_Porsche_actuel
const setCouleurInterieur = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const { couleur_interieur } = req.body;
    if (!couleur_interieur) {
      return res.status(400).json({ message: "couleur_interieur est requis" });
    }

    const couleur = await Couleur_interieur.findById(couleur_interieur);
    if (!couleur) {
      return res
        .status(404)
        .json({ message: "Couleur intérieure introuvable" });
    }

    const model = await Model_porsche_actuel.findById(req.params.id);
    if (!model) {
      return res
        .status(404)
        .json({ message: "Modèle Porsche actuel n'existe pas" });
    }
    if (model.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    model.couleur_interieur = couleur_interieur;
    await model.save();

    const updated = await Model_porsche_actuel.findById(model._id)
      .populate("photo_voiture_actuel", "name alt")
      .populate("couleur_exterieur", "nom_couleur")
      .populate("couleur_interieur", "nom_couleur")
      .populate("taille_jante", "taille_jante couleur_jante");
    return res.status(200).json({
      message: "Couleur intérieure mise à jour avec succès",
      porsche: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Mettre à jour la taille de jante d'un modèle_Porsche_actuel
const setTailleJante = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const { taille_jante } = req.body;
    if (!taille_jante) {
      return res.status(400).json({ message: "taille_jante est requis" });
    }

    const jante = await Taille_jante.findById(taille_jante);
    if (!jante) {
      return res.status(404).json({ message: "Taille de jante introuvable" });
    }

    const model = await Model_porsche_actuel.findById(req.params.id);
    if (!model) {
      return res
        .status(404)
        .json({ message: "Modèle Porsche actuel n'existe pas" });
    }
    if (model.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    model.taille_jante = taille_jante;
    await model.save();

    const updated = await Model_porsche_actuel.findById(model._id)
      .populate("photo_voiture_actuel", "name alt")
      .populate("couleur_exterieur", "nom_couleur")
      .populate("couleur_interieur", "nom_couleur")
      .populate("taille_jante", "taille_jante couleur_jante photo_couleur");
    return res.status(200).json({
      message: "Taille de jante mise à jour avec succès",
      porsche: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Rechercher des Porsches par critères
const searchPorschesByCriteria = async (req, res) => {
  try {
    const {
      type_model,
      type_carrosserie,
      annee_min,
      annee_max,
      couleur_exterieur,
      couleur_interieur,
      taille_jante,
    } = req.query;
    // Construire le filtre de recherche
    const filter = {};
    // Ajouter des conditions au filtre si les critères sont fournis
    if (type_model) {
      filter.type_model = { $regex: type_model, $options: "i" };
    }
    if (type_carrosserie) {
      filter.type_carrosserie = { $regex: type_carrosserie, $options: "i" };
    }
    // Filtrer par plage d'années de production si au moins une est fournie
    if (annee_min || annee_max) {
      filter.annee_production = {};
      if (annee_min) {
        filter.annee_production.$gte = new Date(annee_min);
      }
      if (annee_max) {
        filter.annee_production.$lte = new Date(annee_max);
      }
    }
    // Filtrer par couleur ou jantes si fournie
    if (couleur_exterieur) {
      filter.couleur_exterieur = couleur_exterieur;
    }
    if (couleur_interieur) {
      filter.couleur_interieur = couleur_interieur;
    }
    if (taille_jante) {
      filter.taille_jante = taille_jante;
    }
    // Exécuter la requête avec les filtres construits
    const porsches = await Model_porsche_actuel.find(filter)
      .populate("photo_voiture_actuel", "name alt")
      .populate("couleur_exterieur", "nom_couleur")
      .populate("couleur_interieur", "nom_couleur")
      .populate("taille_jante", "taille_jante couleur_jante")
      .populate("user", "nom prenom email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      total: porsches.length,
      criteres: req.query,
      porsches,
    });
  } catch (error) {
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
  getMesPorsches,
  setCouleurExterieur,
  setCouleurInterieur,
  setTailleJante,
  searchPorschesByCriteria,
};
