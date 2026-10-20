// les requêtes liées aux gammes de voitures
import joi from "joi";
import { PORSCHE_MODELS } from "../utils/model_porsche.constants.js";

export default function voitureValidation(body) {
  const mongoIdSchema = () => joi.string().hex().length(24);

  const voitureCreate = joi.object({
    type_voiture: joi.boolean().required(),
    nom_model: joi
      .string()
      .required()
      .valid(...PORSCHE_MODELS),
    description: joi.string().required().max(1000),
    photo_voiture: joi.array().items(mongoIdSchema()),
    prix: joi.number().optional(),
  });

  const voitureUpdate = joi.object({
    type_voiture: joi.boolean(),
    nom_model: joi.string().valid(...PORSCHE_MODELS),
    description: joi.string(),
    photo_voiture: joi.array().items(mongoIdSchema()),
    prix: joi.number().optional(),
  });

  const voitureAddOrRemoveImage = joi.object({
    photo_voiture: joi.array().items(mongoIdSchema()).required(),
  });

  return {
    voitureCreate: voitureCreate.validate(body),
    voitureUpdate: voitureUpdate.validate(body),
    voitureAddOrRemoveImage: voitureAddOrRemoveImage.validate(body),
  };
}
