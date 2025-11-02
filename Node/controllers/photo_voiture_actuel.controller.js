import Photo_voiture_actuel from "../models/photo_voiture_actuel.model.js";
import photo_voiture_actuelValidation from "../validations/photo_voiture_actuel.validation.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Model_porsche_actuel from "../models/model_porsche_actuel.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createPhoto_voiture_actuel = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      if (req.file) {
        fs.unlinkSync("./uploads/voiture_actuel/" + req.file.filename);
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
        "/uploads/voiture_actuel/" +
        req.file.filename;
    }
    const { error } =
      photo_voiture_actuelValidation(body).photo_voiture_actuelCreate;
    if (error) {
      if (req.file) {
        fs.unlinkSync("./uploads/voiture_actuel/" + req.file.filename);
      }
      return res.status(400).json({ message: error.details[0].message });
    }
    const photo_voiture_actuel = new Photo_voiture_actuel(body);
    const newPhoto_voiture_actuel = await photo_voiture_actuel.save();
    return res.status(201).json(newPhoto_voiture_actuel);
  } catch (error) {
    console.log(error);
    if (req.file) {
      fs.unlinkSync("./uploads/voiture_actuel/" + req.file.filename);
    }
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllPhoto_voiture_actuels = async (req, res) => {
  try {
    const photo_voiture_actuels = await Photo_voiture_actuel.find();
    return res.status(200).json(photo_voiture_actuels);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getPhoto_voiture_actuelById = async (req, res) => {
  try {
    const photo_voiture_actuel = await Photo_voiture_actuel.findById(
      req.params.id
    );
    if (!photo_voiture_actuel) {
      return res
        .status(404)
        .json({ message: "photo_voiture_actuel n'existe pas" });
    }
    return res.status(200).json(photo_voiture_actuel);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const updatePhoto_voiture_actuel = async (req, res) => {
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
        "/uploads/voiture_actuel/" +
        req.file.filename;
    }

    // Valider seulement si body n'est pas vide
    if (body && Object.keys(body).length > 0) {
      const { error } =
        photo_voiture_actuelValidation(body).photo_voiture_actuelUpdate;
      if (error) {
        // Nettoyer le fichier uploadé en cas d'erreur de validation
        if (req.file) {
          fs.unlinkSync("./uploads/voiture_actuel/" + req.file.filename);
        }
        return res.status(400).json({ message: error.details[0].message });
      }
    }

    // Récupérer l'ancienne photo pour supprimer l'ancien fichier si nécessaire
    const oldPhoto = await Photo_voiture_actuel.findById(req.params.id);
    if (!oldPhoto) {
      // Nettoyer le nouveau fichier si la photo n'existe pas
      if (req.file) {
        fs.unlinkSync("./uploads/voiture_actuel/" + req.file.filename);
      }
      return res
        .status(404)
        .json({ message: "photo_voiture_actuel n'existe pas" });
    }

    // Si on remplace l'image, supprimer l'ancienne
    if (req.file && oldPhoto.name) {
      const oldPath = path.join(
        __dirname,
        "../uploads/voiture_actuel/",
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
    const updatedPhoto_voiture_actuel =
      await Photo_voiture_actuel.findByIdAndUpdate(req.params.id, body, {
        new: true,
      });

    return res.status(200).json(updatedPhoto_voiture_actuel);
  } catch (error) {
    console.log(error);
    // Nettoyer le fichier en cas d'erreur serveur
    if (req.file) {
      try {
        fs.unlinkSync("./uploads/voiture_actuel/" + req.file.filename);
      } catch (err) {
        console.log("Erreur lors du nettoyage du fichier:", err);
      }
    }
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deletePhoto_voiture_actuel = async (req, res) => {
  try {
    const model_porsche_actuels = await Model_porsche_actuel.find({
      photo_voiture_actuel: req.params.id,
    });
    if (model_porsche_actuels.length > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer cette image car elle est associée à ${model_porsche_actuels
          .map((model_porsche_actuel) => model_porsche_actuel.type_model)
          .join(", ")}`,
      });
    }

    const photo_voiture_actuel = await Photo_voiture_actuel.findById(
      req.params.id
    );
    if (!photo_voiture_actuel) {
      return res
        .status(404)
        .json({ message: "photo_voiture_actuel n'existe pas" });
    }
    if (photo_voiture_actuel.name) {
      const oldPath = path.join(
        __dirname,
        "../uploads/voiture_actuel/",
        photo_voiture_actuel.name.split("/").at(-1)
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    await photo_voiture_actuel.deleteOne();
    return res
      .status(200)
      .json({ message: "photo_voiture_actuel a été supprimé" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export {
  createPhoto_voiture_actuel,
  getAllPhoto_voiture_actuels,
  getPhoto_voiture_actuelById,
  updatePhoto_voiture_actuel,
  deletePhoto_voiture_actuel,
};
