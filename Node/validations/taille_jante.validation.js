import joi from "joi";
import { TAILLES_JANTE, COULEURS_JANTE } from "../utils/jante.constants.js";

export default function taille_janteValidation(body) {
  const taille_janteCreate = joi.object({
    taille_jante: joi
      .string()
      .valid(...TAILLES_JANTE)
      .required(),
    couleur_jante: joi.string().valid(...COULEURS_JANTE),
    photo_jante: joi.string(),
    description: joi.string().max(500),
    prix: joi.number().min(0).max(100000),
  });

  const taille_janteUpdate = joi.object({
    taille_jante: joi.string().valid(...TAILLES_JANTE),
    couleur_jante: joi.string().valid(...COULEURS_JANTE),
    photo_jante: joi.string(),
    description: joi.string().max(500),
    prix: joi.number().min(0).max(100000),
  });

  return {
    taille_janteCreate: taille_janteCreate.validate(body),
    taille_janteUpdate: taille_janteUpdate.validate(body),
  };
}
