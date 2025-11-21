import Joi from "joi";
import { validateObjectId } from "../utils/validation.utils.js";

/**
 * Validation pour l'ajout d'une voiture neuve au panier
 */
const ajouterVoitureNeuveSchema = Joi.object({
  model_porsche_id: Joi.string().custom(validateObjectId).required().messages({
    "any.required": "L'ID du modèle Porsche est requis",
    "string.empty": "L'ID du modèle Porsche ne peut pas être vide",
  }),
});

/**
 * Validation pour l'ajout d'un accessoire au panier
 */
const ajouterAccessoireSchema = Joi.object({
  accesoire_id: Joi.string().custom(validateObjectId).required().messages({
    "any.required": "L'ID de l'accessoire est requis",
    "string.empty": "L'ID de l'accessoire ne peut pas être vide",
  }),
  quantite: Joi.number().integer().min(1).max(1000).default(1).messages({
    "number.base": "La quantité doit être un nombre",
    "number.integer": "La quantité doit être un entier",
    "number.min": "La quantité doit être au moins 1",
    "number.max": "La quantité ne peut pas dépasser 1000",
  }),
});

export default {
  ajouterVoitureNeuve: ajouterVoitureNeuveSchema,
  ajouterAccessoire: ajouterAccessoireSchema,
};
