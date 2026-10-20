import { COULEURS_INTERIEUR } from "../utils/couleur_interieur.constants.js";
import joi from "joi";

export default function couleur_interieurValidation(body) {
  const couleur_interieurCreate = joi.object({
    nom_couleur: joi
      .string()
      .required()
      // Liste des couleurs d'intérieur disponibles
      .valid(...COULEURS_INTERIEUR)
      .max(100),
    photo_couleur: joi.string(),
    description: joi.string().max(500),
    prix: joi.number().min(0).max(100000),
    model_porsche: joi.array().items(joi.string().hex().length(24)),
  });

  const couleur_interieurUpdate = joi.object({
    nom_couleur: joi.string().valid(...COULEURS_INTERIEUR),
    photo_couleur: joi.string(),
    description: joi.string().max(500),
    prix: joi.number().min(0).max(100000),
    model_porsche: joi.array().items(joi.string().hex().length(24)),
  });

  return {
    couleur_interieurCreate: couleur_interieurCreate.validate(body),
    couleur_interieurUpdate: couleur_interieurUpdate.validate(body),
  };
}
