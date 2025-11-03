import Model_porsche from "../models/model_porsche.model.js";
import model_porscheValidation from "../validations/model_porsche.validation.js";
import Voiture from "../models/voiture.model.js";
import Couleur_exterieur from "../models/couleur_exterieur.model.js";
import Couleur_interieur from "../models/couleur_interieur.model.js";
import Taille_jante from "../models/taille_jante.model.js";
import Photo_porsche from "../models/photo_porsche.model.js";

const createModel_porsche = async (req, res) => {
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

    const { error } = model_porscheValidation(body).model_porscheCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Vérifier que la voiture existe
    const voiture = await Voiture.findById(body.voiture);
    if (!voiture) {
      return res.status(404).json({ message: "Voiture introuvable" });
    }

    // Vérifier que la couleur extérieure existe si fournie
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

    // Vérifier que les couleurs intérieures existent si fournies
    if (body.couleur_interieur && Array.isArray(body.couleur_interieur)) {
      for (let couleurId of body.couleur_interieur) {
        const couleurInt = await Couleur_interieur.findById(couleurId);
        if (!couleurInt) {
          return res
            .status(404)
            .json({ message: `Couleur intérieure ${couleurId} introuvable` });
        }
      }
    }

    // Vérifier que la taille de jante existe si fournie
    if (body.taille_jante) {
      const jante = await Taille_jante.findById(body.taille_jante);
      if (!jante) {
        return res.status(404).json({ message: "Taille de jante introuvable" });
      }
    }

    // Vérifier que les photos existent si fournies
    if (body.photo_porsche && Array.isArray(body.photo_porsche)) {
      for (let photoId of body.photo_porsche) {
        const photo = await Photo_porsche.findById(photoId);
        if (!photo) {
          return res
            .status(404)
            .json({ message: `Photo ${photoId} introuvable` });
        }
      }
    }

    const model_porsche = new Model_porsche(body);
    const newModel_porsche = await model_porsche.save();

    const populatedModel = await Model_porsche.findById(newModel_porsche._id)
      .populate("photo_porsche", "name alt")
      .populate("voiture", "nom_model type_voiture description prix")
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante couleur_jante");

    return res.status(201).json({
      message: "Modèle Porsche créé avec succès",
      model_porsche: populatedModel,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllModel_porsches = async (req, res) => {
  try {
    const model_porsches = await Model_porsche.find()
      .populate("photo_porsche", "name alt")
      .populate("voiture", "nom_model type_voiture description prix")
      .populate("couleur_exterieur", "nom_couleur photo_couleur prix")
      .populate("couleur_interieur", "nom_couleur photo_couleur prix")
      .populate("taille_jante", "taille_jante couleur_jante prix")
      .sort({ annee_production: -1 });

    // Ajouter le calcul de prix pour chaque modèle
    const model_porschesWithPrix = model_porsches.map((model) => {
      const prixBase = model.voiture?.prix || 0;
      const prixCouleurExt = model.couleur_exterieur?.prix || 0;

      let prixCouleursInt = 0;
      if (model.couleur_interieur && Array.isArray(model.couleur_interieur)) {
        prixCouleursInt = model.couleur_interieur.reduce((total, couleur) => {
          return total + (couleur?.prix || 0);
        }, 0);
      }

      const prixJante = model.taille_jante?.prix || 0;
      const prixTotal = prixBase + prixCouleurExt + prixCouleursInt + prixJante;

      return {
        ...model.toObject(),
        prix_calcule: {
          prix_base: prixBase,
          total_options: prixCouleurExt + prixCouleursInt + prixJante,
          prix_total: prixTotal,
        },
      };
    });

    return res.status(200).json(model_porschesWithPrix);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const getModel_porscheById = async (req, res) => {
  try {
    const model_porsche = await Model_porsche.findById(req.params.id)
      .populate("photo_porsche", "name alt")
      .populate("voiture", "nom_model type_voiture description prix")
      .populate(
        "couleur_exterieur",
        "nom_couleur photo_couleur description prix"
      )
      .populate(
        "couleur_interieur",
        "nom_couleur photo_couleur description prix"
      )
      .populate("taille_jante", "taille_jante couleur_jante description prix");
    if (!model_porsche) {
      return res.status(404).json({ message: "Modèle Porsche n'existe pas" });
    }

    // Calculer le prix total automatiquement
    const prixBase = model_porsche.voiture?.prix || 0;
    const prixCouleurExt = model_porsche.couleur_exterieur?.prix || 0;

    let prixCouleursInt = 0;
    if (
      model_porsche.couleur_interieur &&
      Array.isArray(model_porsche.couleur_interieur)
    ) {
      prixCouleursInt = model_porsche.couleur_interieur.reduce(
        (total, couleur) => {
          return total + (couleur?.prix || 0);
        },
        0
      );
    }

    const prixJante = model_porsche.taille_jante?.prix || 0;
    const prixTotal = prixBase + prixCouleurExt + prixCouleursInt + prixJante;

    // Ajouter le prix calculé à la réponse
    const response = {
      ...model_porsche.toObject(),
      prix_calcule: {
        prix_base: prixBase,
        options: {
          couleur_exterieur: prixCouleurExt,
          couleurs_interieur: prixCouleursInt,
          taille_jante: prixJante,
        },
        total_options: prixCouleurExt + prixCouleursInt + prixJante,
        prix_total: prixTotal,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const updateModel_porsche = async (req, res) => {
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

    const { error } = model_porscheValidation(body).model_porscheUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Vérifier que le modèle existe
    const modelExist = await Model_porsche.findById(req.params.id);
    if (!modelExist) {
      return res.status(404).json({ message: "Modèle Porsche n'existe pas" });
    }

    // Vérifier que la voiture existe si fournie
    if (body.voiture) {
      const voiture = await Voiture.findById(body.voiture);
      if (!voiture) {
        return res.status(404).json({ message: "Voiture introuvable" });
      }
    }

    // Vérifier que la couleur extérieure existe si fournie
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

    // Vérifier que les couleurs intérieures existent si fournies
    if (body.couleur_interieur && Array.isArray(body.couleur_interieur)) {
      for (let couleurId of body.couleur_interieur) {
        const couleurInt = await Couleur_interieur.findById(couleurId);
        if (!couleurInt) {
          return res
            .status(404)
            .json({ message: `Couleur intérieure ${couleurId} introuvable` });
        }
      }
    }

    // Vérifier que la taille de jante existe si fournie
    if (body.taille_jante) {
      const jante = await Taille_jante.findById(body.taille_jante);
      if (!jante) {
        return res.status(404).json({ message: "Taille de jante introuvable" });
      }
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
      .populate("taille_jante", "taille_jante couleur_jante");

    if (!updatedModel_porsche) {
      return res.status(404).json({ message: "Modèle Porsche n'existe pas" });
    }

    return res.status(200).json({
      message: "Modèle Porsche mis à jour avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteModel_porsche = async (req, res) => {
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

    const model_porsche = await Model_porsche.findByIdAndDelete(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: "Modèle Porsche n'existe pas" });
    }
    return res
      .status(200)
      .json({ message: "Modèle Porsche supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const addImages = async (req, res) => {
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

    const { error } =
      model_porscheValidation(body).model_porscheAddOrRemoveImage;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const model_porsche = await Model_porsche.findById(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: "Modèle Porsche n'existe pas" });
    }

    // Vérifier que les photos existent
    for (let photoId of body.photo_porsche) {
      const photo = await Photo_porsche.findById(photoId);
      if (!photo) {
        return res
          .status(404)
          .json({ message: `Photo ${photoId} introuvable` });
      }
    }

    // Ajouter les photos sans doublons
    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { photo_porsche: { $each: body.photo_porsche } } },
      { new: true }
    )
      .populate("photo_porsche", "name alt")
      .populate("voiture", "nom_model type_voiture")
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante couleur_jante");

    return res.status(200).json({
      message: "Photos ajoutées avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const removeImages = async (req, res) => {
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

    const { error } =
      model_porscheValidation(body).model_porscheAddOrRemoveImage;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const model_porsche = await Model_porsche.findById(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: `Modèle Porsche n'existe pas` });
    }

    // Vérifier que les photos existent
    for (let photoId of body.photo_porsche) {
      const photo = await Photo_porsche.findById(photoId);
      if (!photo) {
        return res
          .status(404)
          .json({ message: `Photo ${photoId} introuvable` });
      }
    }

    // Retirer les photos
    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      { $pull: { photo_porsche: { $in: body.photo_porsche } } },
      { new: true }
    )
      .populate("photo_porsche", "name alt")
      .populate("voiture", "nom_model type_voiture")
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante couleur_jante");

    return res.status(200).json({
      message: "Photos supprimées avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Gestion couleur extérieure
const addCouleurExterieur = async (req, res) => {
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

    const { couleur_exterieur } = req.body;
    if (!couleur_exterieur) {
      return res.status(400).json({ message: "couleur_exterieur est requis" });
    }

    const model_porsche = await Model_porsche.findById(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: "Modèle Porsche n'existe pas" });
    }

    // Vérifier que la couleur existe
    const couleurExt = await Couleur_exterieur.findById(couleur_exterieur);
    if (!couleurExt) {
      return res
        .status(404)
        .json({ message: "Couleur extérieure introuvable" });
    }

    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      { couleur_exterieur },
      { new: true }
    )
      .populate("couleur_exterieur", "nom_couleur photo_couleur description")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante couleur_jante")
      .populate("voiture", "nom_model type_voiture");

    return res.status(200).json({
      message: "Couleur extérieure ajoutée avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const removeCouleurExterieur = async (req, res) => {
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

    const model_porsche = await Model_porsche.findById(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: "Modèle Porsche n'existe pas" });
    }

    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      { $unset: { couleur_exterieur: "" } },
      { new: true }
    )
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante couleur_jante")
      .populate("voiture", "nom_model type_voiture");

    return res.status(200).json({
      message: "Couleur extérieure supprimée avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Gestion couleurs intérieures (Many-to-Many)
const addCouleursInterieur = async (req, res) => {
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

    const { couleur_interieur } = req.body;
    if (!couleur_interieur || !Array.isArray(couleur_interieur)) {
      return res
        .status(400)
        .json({ message: "couleur_interieur (array) est requis" });
    }

    const model_porsche = await Model_porsche.findById(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: "Modèle Porsche n'existe pas" });
    }

    // Vérifier que toutes les couleurs existent
    for (let couleurId of couleur_interieur) {
      const couleurInt = await Couleur_interieur.findById(couleurId);
      if (!couleurInt) {
        return res
          .status(404)
          .json({ message: `Couleur intérieure ${couleurId} introuvable` });
      }
    }

    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { couleur_interieur: { $each: couleur_interieur } } },
      { new: true }
    )
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante couleur_jante")
      .populate("voiture", "nom_model type_voiture");

    return res.status(200).json({
      message: "Couleurs intérieures ajoutées avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const removeCouleursInterieur = async (req, res) => {
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

    const { couleur_interieur } = req.body;
    if (!couleur_interieur || !Array.isArray(couleur_interieur)) {
      return res.status(400).json({
        message: "couleur_interieur doit être un tableau d'IDs",
      });
    }

    const model_porsche = await Model_porsche.findById(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: "Modèle Porsche n'existe pas" });
    }

    // Vérifier que toutes les couleurs existent
    for (let couleurId of couleur_interieur) {
      const couleurInt = await Couleur_interieur.findById(couleurId);
      if (!couleurInt) {
        return res
          .status(404)
          .json({ message: `Couleur intérieure ${couleurId} introuvable` });
      }
    }

    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      { $pull: { couleur_interieur: { $in: couleur_interieur } } },
      { new: true }
    )
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante couleur_jante")
      .populate("voiture", "nom_model type_voiture");

    return res.status(200).json({
      message: "Couleurs intérieures supprimées avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Gestion taille de jante
const addTailleJante = async (req, res) => {
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

    const { taille_jante } = req.body;
    if (!taille_jante) {
      return res.status(400).json({ message: "taille_jante est requis" });
    }

    const model_porsche = await Model_porsche.findById(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: "Modèle Porsche n'existe pas" });
    }

    // Vérifier que la taille de jante existe
    const jante = await Taille_jante.findById(taille_jante);
    if (!jante) {
      return res.status(404).json({ message: "Taille de jante introuvable" });
    }

    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      { taille_jante },
      { new: true }
    )
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante couleur_jante")
      .populate("voiture", "nom_model type_voiture");

    return res.status(200).json({
      message: "Taille de jante ajoutée avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const removeTailleJante = async (req, res) => {
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

    const model_porsche = await Model_porsche.findById(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: "Modèle Porsche n'existe pas" });
    }

    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      { $unset: { taille_jante: "" } },
      { new: true }
    )
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("voiture", "nom_model type_voiture");

    return res.status(200).json({
      message: "Taille de jante supprimée avec succès",
      model_porsche: updatedModel_porsche,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Calculer le prix total du modèle avec toutes les options
const calculatePrixTotal = async (req, res) => {
  try {
    const model_porsche = await Model_porsche.findById(req.params.id)
      .populate("voiture", "prix")
      .populate("couleur_exterieur", "prix")
      .populate("couleur_interieur", "prix")
      .populate("taille_jante", "prix");

    if (!model_porsche) {
      return res.status(404).json({ message: "Modèle Porsche introuvable" });
    }

    // Prix de base de la voiture
    const prixBase = model_porsche.voiture?.prix || 0;

    // Prix de la couleur extérieure
    const prixCouleurExt = model_porsche.couleur_exterieur?.prix || 0;

    // Prix des couleurs intérieures (somme de toutes les couleurs)
    let prixCouleursInt = 0;
    if (
      model_porsche.couleur_interieur &&
      Array.isArray(model_porsche.couleur_interieur)
    ) {
      prixCouleursInt = model_porsche.couleur_interieur.reduce(
        (total, couleur) => {
          return total + (couleur?.prix || 0);
        },
        0
      );
    }

    // Prix de la taille de jante
    const prixJante = model_porsche.taille_jante?.prix || 0;

    // Prix total
    const prixTotal = prixBase + prixCouleurExt + prixCouleursInt + prixJante;

    // Détails du calcul
    const detailsPrix = {
      prix_base: prixBase,
      options: {
        couleur_exterieur: prixCouleurExt,
        couleurs_interieur: prixCouleursInt,
        taille_jante: prixJante,
      },
      total_options: prixCouleurExt + prixCouleursInt + prixJante,
      prix_total: prixTotal,
    };

    return res.status(200).json({
      message: "Prix total calculé avec succès",
      model_id: model_porsche._id,
      nom_model: model_porsche.nom_model,
      details_prix: detailsPrix,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Obtenir le modèle complet avec le prix total calculé
const getModel_porscheWithPrixTotal = async (req, res) => {
  try {
    const model_porsche = await Model_porsche.findById(req.params.id)
      .populate("photo_porsche", "name alt")
      .populate("voiture", "nom_model type_voiture description prix")
      .populate(
        "couleur_exterieur",
        "nom_couleur photo_couleur description prix"
      )
      .populate(
        "couleur_interieur",
        "nom_couleur photo_couleur description prix"
      )
      .populate("taille_jante", "taille_jante couleur_jante description prix");

    if (!model_porsche) {
      return res.status(404).json({ message: "Modèle Porsche introuvable" });
    }

    // Calculer le prix total
    const prixBase = model_porsche.voiture?.prix || 0;
    const prixCouleurExt = model_porsche.couleur_exterieur?.prix || 0;

    let prixCouleursInt = 0;
    if (
      model_porsche.couleur_interieur &&
      Array.isArray(model_porsche.couleur_interieur)
    ) {
      prixCouleursInt = model_porsche.couleur_interieur.reduce(
        (total, couleur) => {
          return total + (couleur?.prix || 0);
        },
        0
      );
    }

    const prixJante = model_porsche.taille_jante?.prix || 0;
    const prixTotal = prixBase + prixCouleurExt + prixCouleursInt + prixJante;

    // Créer l'objet de réponse avec le prix total
    const response = {
      ...model_porsche.toObject(),
      prix_calcule: {
        prix_base: prixBase,
        options: {
          couleur_exterieur: prixCouleurExt,
          couleurs_interieur: prixCouleursInt,
          taille_jante: prixJante,
        },
        total_options: prixCouleurExt + prixCouleursInt + prixJante,
        prix_total: prixTotal,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
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
  calculatePrixTotal,
  getModel_porscheWithPrixTotal,
};
