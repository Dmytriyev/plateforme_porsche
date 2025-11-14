import joi from "joi";
import { TYPES_ACCESOIRE } from "../utils/accesoire.constants.js";

export default function accesoireValidation(body) {
  const mongoIdSchema = () => joi.string().hex().length(24);

  const accesoireCreate = joi.object({
    type_accesoire: joi
      .string()
      .required()
      // Liste des types d'accesoires disponibles
      .valid(...TYPES_ACCESOIRE)
      .max(150),
    nom_accesoire: joi.string().required().max(250),
    description: joi.string().required().max(1000),
    prix: joi.number().min(0).required().max(1000000),
    couleur_accesoire: mongoIdSchema(),
    photo_accesoire: joi.array().items(mongoIdSchema()),
  });

  const accesoireUpdate = joi.object({
    type_accesoire: joi.string().valid(...TYPES_ACCESOIRE),
    nom_accesoire: joi.string(),
    description: joi.string(),
    prix: joi.number().min(0),
    couleur_accesoire: mongoIdSchema(),
    photo_accesoire: joi.array().items(mongoIdSchema()),
  });

  const accesoireAddOrRemoveImage = joi.object({
    photo_accesoire: joi.array().items(mongoIdSchema()).required(),
  });

  const accesoireSetCouleur = joi.object({
    couleur_accesoire: mongoIdSchema().required(),
  });

  return {
    accesoireCreate: accesoireCreate.validate(body),
    accesoireUpdate: accesoireUpdate.validate(body),
    accesoireAddOrRemoveImage: accesoireAddOrRemoveImage.validate(body),
    accesoireSetCouleur: accesoireSetCouleur.validate(body),
  };
}
