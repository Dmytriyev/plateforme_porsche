import Photo_porsche from "../models/photo_porsche.model.js";
import photo_porscheValidation from "../validations/photo_porsche.validation.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Model_porsche from "../models/model_porsche.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer une nouvelle photo Porsche
const createPhoto_porsche = async (req, res) => {
  try {
    // Vérifier l'authentification
    if (!req.user) {
      if (req.file) {
        // Supprimer le fichier uploadé en cas de non-authentification
        removeUploadedFile(req.file.filename);
      }
      return res.status(401).json({ message: "Non autorisé" });
    }
    // Vérifier que l'utilisateur est admin ou staff
    if (!(req.user.isAdmin || req.user.isStaff)) {
      if (req.file) {
        // Supprimer le fichier uploadé en cas d'absence de droits
        removeUploadedFile(req.file.filename);
      }
      return res
        .status(403)
        .json({ message: "Accès réservé aux administrateurs ou au personnel" });
    }

    // Valider les données de la requête
    let body = req.body || {};
    // Si un fichier est uploadé, ajouter le champ name avec l'URL complète de l'image
    if (req.file) {
      body.name = "/uploads/model_porsche/" + req.file.filename;
    }

    // Supprimer du body les champs correspondant aux fichiers envoyés (ex: "photo")
    if (req.files && Array.isArray(req.files)) {
      for (const f of req.files) {
        if (
          f &&
          f.fieldname &&
          body &&
          Object.prototype.hasOwnProperty.call(body, f.fieldname)
        ) {
          delete body[f.fieldname];
        }
      }
    }
    // Vérifier qu'il y a des données (body) à créer
    if (!body || Object.keys(body).length === 0) {
      if (req.file) {
        removeUploadedFile(req.file.filename);
      }
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = photo_porscheValidation(body).photo_porscheCreate;
    if (error) {
      if (req.file) {
        removeUploadedFile(req.file.filename);
      }
      return res.status(400).json({ message: error.details[0].message });
    }

    // Vérifier que le modèle Porsche existe si fourni
    if (body.model_porsche) {
      const model_porsche = await Model_porsche.findById(body.model_porsche);
      if (!model_porsche) {
        if (req.file) {
          removeUploadedFile(req.file.filename);
        }
        return res.status(404).json({ message: "Modèle Porsche introuvable" });
      }
    }

    // Créer et sauvegarder la nouvelle photo Porsche
    const photo_porsche = new Photo_porsche(body);
    const newPhoto_porsche = await photo_porsche.save();

    // Retourner la nouvelle photo créée
    const populatedPhoto = await Photo_porsche.findById(
      newPhoto_porsche._id
    ).populate("model_porsche", "nom_model numero_win");

    return res.status(201).json({
      message: "Photo Porsche créée avec succès",
      photo: populatedPhoto,
    });
  } catch (error) {
    if (req.file) {
      removeUploadedFile(req.file.filename);
    }
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Récupérer toutes les photos Porsche
const getAllPhoto_porsches = async (req, res) => {
  try {
    const photo_porsches = await Photo_porsche.find()
      .populate("model_porsche", "nom_model numero_win")
      .sort({ createdAt: -1 });
    return res.status(200).json(photo_porsches);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Récupérer une photo Porsche par ID
const getPhoto_porscheById = async (req, res) => {
  try {
    const photo_porsche = await Photo_porsche.findById(req.params.id).populate(
      "model_porsche",
      "nom_model numero_win description prix"
    );
    if (!photo_porsche) {
      return res.status(404).json({ message: "Photo Porsche n'existe pas" });
    }
    return res.status(200).json(photo_porsche);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};
// Mettre à jour une photo Porsche
const updatePhoto_porsche = async (req, res) => {
  try {
    if (!req.user) {
      if (req.file) {
        removeUploadedFile(req.file.filename);
      }
      return res.status(401).json({ message: "Non autorisé" });
    }
    // Vérifier que l'utilisateur est admin ou staff
    if (!(req.user.isAdmin || req.user.isStaff)) {
      if (req.file) {
        // Supprimer le fichier uploadé en cas d'absence de droits
        removeUploadedFile(req.file.filename);
      }
      return res
        .status(403)
        .json({ message: "Accès réservé aux administrateurs ou au personnel" });
    }

    // Valider les données de la requête
    const { body } = req;
    // Vérifier qu'il y a des données (body ou file) à mettre à jour
    if ((!body || Object.keys(body).length === 0) && !req.file) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }
    // Si un fichier est uploadé, mettre à jour le champ name avec l'URL complète de l'image
    if (req.file) {
      body.name = "/uploads/model_porsche/" + req.file.filename;
    }
    // Supprimer du body les champs correspondant aux fichiers envoyés (ex: "photo")
    if (req.files && Array.isArray(req.files)) {
      for (const f of req.files) {
        if (
          f &&
          f.fieldname &&
          body &&
          Object.prototype.hasOwnProperty.call(body, f.fieldname)
        ) {
          delete body[f.fieldname];
        }
      }
    }
    // Valider seulement si body n'est pas vide
    if (body && Object.keys(body).length > 0) {
      const { error } = photo_porscheValidation(body).photo_porscheUpdate;
      if (error) {
        // Nettoyer le fichier uploadé en cas d'erreur de validation
        if (req.file) {
          removeUploadedFile(req.file.filename);
        }
        return res.status(400).json({ message: error.details[0].message });
      }
    }
    // Vérifier que le modèle Porsche existe si fourni dans la mise à jour des données
    if (body.model_porsche) {
      const model_porsche = await Model_porsche.findById(body.model_porsche);
      if (!model_porsche) {
        if (req.file) {
          removeUploadedFile(req.file.filename);
        }
        return res.status(404).json({ message: "Modèle Porsche introuvable" });
      }
    }

    // Récupérer l'ancienne photo pour supprimer l'ancien fichier si nécessaire
    const oldPhoto = await Photo_porsche.findById(req.params.id);
    if (!oldPhoto) {
      // Nettoyer le nouveau fichier si la photo n'existe pas
      if (req.file) {
        removeUploadedFile(req.file.filename);
      }
      return res.status(404).json({ message: "Photo Porsche n'existe pas" });
    }
    // Si on remplace l'image, supprimer l'ancienne du système de fichiers
    if (req.file && oldPhoto.name) {
      removeUploadedFile(oldPhoto.name.split("/").at(-1));
    }

    // Mettre à jour la photo Porsche dans la base de données
    const updatedPhoto_porsche = await Photo_porsche.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    ).populate("model_porsche", "nom_model numero_win");
    return res.status(200).json({
      message: "Photo Porsche mise à jour avec succès",
      photo: updatedPhoto_porsche,
    });
  } catch (error) {
    // Nettoyer le fichier en cas d'erreur serveur
    if (req.file) {
      removeUploadedFile(req.file.filename);
    }
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

// Supprimer un fichier uploadé
const removeUploadedFile = (FilenameOrPath) => {
  try {
    // Accepte soit un chemin absolu, soit juste le nom de fichier
    const filePath = path.isAbsolute(FilenameOrPath)
      ? FilenameOrPath
      : path.join(__dirname, "../uploads/model_porsche/", FilenameOrPath);
    // Supprimer le fichier s'il existe
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Erreur lors de la suppression du fichier:", err);
  }
};

// Supprimer une photo Porsche
const deletePhoto_porsche = async (req, res) => {
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

    // Trouver la photo Porsche à supprimer
    const photo_porsche = await Photo_porsche.findById(req.params.id);
    if (!photo_porsche) {
      return res.status(404).json({ message: "Photo Porsche n'existe pas" });
    }
    // Supprimer le fichier image du système de fichiers s'il existe
    if (photo_porsche.name) {
      removeUploadedFile(photo_porsche.name.split("/").at(-1));
    }
    await photo_porsche.deleteOne();
    return res
      .status(200)
      .json({ message: "Photo Porsche supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export {
  createPhoto_porsche,
  getAllPhoto_porsches,
  getPhoto_porscheById,
  updatePhoto_porsche,
  deletePhoto_porsche,
};
