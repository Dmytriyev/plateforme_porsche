import Photo_voiture from "../models/photo_voiture.model.js";
import photo_voitureValidation from "../validations/photo_voiture.validation.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Voiture from "../models/voiture.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createPhoto_voiture = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      if (req.file) {
        fs.unlinkSync("./uploads/voiture/" + req.file.filename);
      }
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    if (req.file) {
      body.name =
        req.protocol +
        "://" +
        req.get("host") +
        "/uploads/voiture/" +
        req.file.filename;
    }
    const { error } = photo_voitureValidation(body).photo_voitureCreate;
    if (error) {
      if (req.file) {
        fs.unlinkSync("./uploads/voiture/" + req.file.filename);
      }
      return res.status(400).json({ message: error.details[0].message });
    }
    const photo_voiture = new Photo_voiture(body);
    const newPhoto_voiture = await photo_voiture.save();

    // Retourner avec populate
    const populatedPhoto = await Photo_voiture.findById(newPhoto_voiture._id)
      .populate("voiture", "nom_model type_voiture")
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante");

    return res.status(201).json(populatedPhoto);
  } catch (error) {
    console.log(error);
    if (req.file) {
      fs.unlinkSync("./uploads/voiture/" + req.file.filename);
    }
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllPhoto_voitures = async (req, res) => {
  try {
    const photo_voitures = await Photo_voiture.find()
      .populate("voiture", "nom_model type_voiture")
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante")
      .sort({ createdAt: -1 });
    return res.status(200).json(photo_voitures);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getPhoto_voitureById = async (req, res) => {
  try {
    const photo_voiture = await Photo_voiture.findById(req.params.id)
      .populate("voiture", "nom_model type_voiture description prix")
      .populate("couleur_exterieur", "nom_couleur photo_couleur description")
      .populate("couleur_interieur", "nom_couleur photo_couleur description")
      .populate("taille_jante", "taille_jante");
    if (!photo_voiture) {
      return res.status(404).json({ message: "photo de voiture n'existe pas" });
    }
    return res.status(200).json(photo_voiture);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const updatePhoto_voiture = async (req, res) => {
  try {
    const { body } = req;

    // Vérifier qu'il y a des données (body ou file)
    if ((!body || Object.keys(body).length === 0) && !req.file) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Si un fichier est uploadé, mettre à jour le champ name
    if (req.file) {
      body.name =
        req.protocol +
        "://" +
        req.get("host") +
        "/uploads/voiture/" +
        req.file.filename;
    }

    // Valider seulement si body n'est pas vide
    if (body && Object.keys(body).length > 0) {
      const { error } = photo_voitureValidation(body).photo_voitureUpdate;
      if (error) {
        // Nettoyer le fichier uploadé en cas d'erreur de validation
        if (req.file) {
          fs.unlinkSync("./uploads/voiture/" + req.file.filename);
        }
        return res.status(400).json({ message: error.details[0].message });
      }
    }

    // Récupérer l'ancienne photo pour supprimer l'ancien fichier si nécessaire
    const oldPhoto = await Photo_voiture.findById(req.params.id);
    if (!oldPhoto) {
      // Nettoyer le nouveau fichier si la photo n'existe pas
      if (req.file) {
        fs.unlinkSync("./uploads/voiture/" + req.file.filename);
      }
      return res.status(404).json({ message: "photo de voiture n'existe pas" });
    }

    // Si on remplace l'image, supprimer l'ancienne
    if (req.file && oldPhoto.name) {
      const oldPath = path.join(
        __dirname,
        "../uploads/voiture/",
        oldPhoto.name.split("/").at(-1)
      );
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.log(
            "Erreur lors de la suppression de l'ancien fichier:",
            err
          );
        }
      }
    }

    // Mettre à jour la photo
    const updatedPhoto_voiture = await Photo_voiture.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    )
      .populate("voiture", "nom_model type_voiture")
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante");

    return res.status(200).json(updatedPhoto_voiture);
  } catch (error) {
    console.log(error);
    // Nettoyer le fichier en cas d'erreur serveur
    if (req.file) {
      try {
        fs.unlinkSync("./uploads/voiture/" + req.file.filename);
      } catch (err) {
        console.log("Erreur lors du nettoyage du fichier:", err);
      }
    }
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deletePhoto_voiture = async (req, res) => {
  try {
    const voitures = await Voiture.find({ photo_voiture: req.params.id });
    if (voitures.length > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer cette image car elle est associée à ${voitures
          .map((voiture) => voiture.nom_model)
          .join(", ")}`,
      });
    }
    const photo_voiture = await Photo_voiture.findById(req.params.id);
    if (!photo_voiture) {
      return res.status(404).json({ message: "photo de voiture n'existe pas" });
    }

    if (photo_voiture.name) {
      const oldPath = path.join(
        __dirname,
        "../uploads/voiture/",
        photo_voiture.name.split("/").at(-1)
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    await photo_voiture.deleteOne();
    return res
      .status(200)
      .json({ message: "photo de voiture a été supprimée avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Recherche de photos par critères
const getPhotosByCriteria = async (req, res) => {
  try {
    const { voiture, couleur_exterieur, couleur_interieur, taille_jante } =
      req.query;

    let query = {};

    if (voiture) query.voiture = voiture;
    if (couleur_exterieur) query.couleur_exterieur = couleur_exterieur;
    if (couleur_interieur) query.couleur_interieur = couleur_interieur;
    if (taille_jante) query.taille_jante = taille_jante;

    const photos = await Photo_voiture.find(query)
      .populate("voiture", "nom_model type_voiture")
      .populate("couleur_exterieur", "nom_couleur photo_couleur")
      .populate("couleur_interieur", "nom_couleur photo_couleur")
      .populate("taille_jante", "taille_jante")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: photos.length,
      filters: query,
      photos,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export {
  createPhoto_voiture,
  getAllPhoto_voitures,
  getPhoto_voitureById,
  updatePhoto_voiture,
  deletePhoto_voiture,
  getPhotosByCriteria,
};
