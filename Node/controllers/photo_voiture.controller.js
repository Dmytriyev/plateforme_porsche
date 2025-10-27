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
    if (!body) {
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
      return res.status(401).json(error.details[0].message);
    }
    const photo_voiture = new Photo_voiture(body);
    const newPhoto_voiture = await photo_voiture.save();
    return res.status(201).json(newPhoto_voiture);
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
    const photo_voitures = await Photo_voiture.find();
    return res.status(200).json(photo_voitures);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getPhoto_voitureById = async (req, res) => {
  try {
    const photo_voiture = await Photo_voiture.findById(req.params.id);
    if (!photo_voiture) {
      return res.status(404).json({ message: "photo_voiture n'existe pas" });
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
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    const { error } = photo_voitureValidation(body).photo_voitureUpdate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }

    const updatedPhoto_voiture = await Photo_voiture.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );

    if (!updatedPhoto_voiture) {
      res.status(404).json({ message: "photo_voiture n'existe pas" });
    }

    return res.status(200).json(updatedPhoto_voiture);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deletePhoto_voiture = async (req, res) => {
  try {
    const voitures = await Voiture.find({ photo_voitures: req.params.id });
    if (!voitures > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer cette image car elle est associée à ${voitures
          .map((voiture) => voiture.type_model)
          .join(", ")}`,
      });
    }
    const photo_voiture = await Photo_voiture.findById(req.params.id);
    if (!photo_voiture) {
      return res.status(404).json({ message: "photo_voiture n'existe pas" });
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
    return res.status(200).json({ message: "photo_voiture a été supprimé" });
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
};
