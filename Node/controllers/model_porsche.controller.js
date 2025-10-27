import Model_porsche from "../models/model_porsche.model.js";
import model_porscheValidation from "../validations/model_porsche.validation.js";

const createModel_porsche = async (req, res) => {
  try {
    const { body } = req;
    if (!body) {
      return res.status(400).json({ message: "no data in the request" });
    }
    const { error } = model_porscheValidation(body).model_porscheCreate;
    if (error) {
      return res.status(401).json(error.details[0].message);
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
    const model_porsches = await Model_porsche.find();
    return res.status(200).json(model_porsches);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getModel_porscheById = async (req, res) => {
  try {
    const model_porsche = await Model_porsche.findById(req.params.id);
    if (!model_porsche) {
      return res.status(404).json({ message: "model_porsche n'existe pas" });
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
    if (!body) {
      return res.status(400).json({ message: "No data in the request" });
    }

    const { error } = model_porscheValidation(body).model_porscheUpdate;
    if (error) {
      return res.status(401).json(error.details[0].message);
    }
    const updatedModel_porsche = await Model_porsche.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );
    if (!updatedModel_porsche) {
      return res.status(404).json({ message: "model_porsche n'existe pas" });
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
      return res.status(404).json({ message: "model_porsche n'existe pas" });
    }
    return res.status(200).json({ message: "model_porsche has been deleted" });
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
};
