import joi from "joi";
import { TYPES_SIEGE } from "../utils/siege.constants.js";

export default function siegeValidation(body) {
  const siegeCreate = joi.object({
    nom_siege: joi
      .string()
      .valid(...TYPES_SIEGE)
      .required(),
    description: joi.string().max(1000),
    options_confort: joi.object({
      ventilation: joi.boolean(),
      chauffage: joi.boolean(),
    }),
    photo_siege: joi.string(),
    prix: joi.number().min(0).max(50000),
  });

  const siegeUpdate = joi.object({
    nom_siege: joi.string().valid(...TYPES_SIEGE),
    description: joi.string().max(1000),
    options_confort: joi.object({
      ventilation: joi.boolean(),
      chauffage: joi.boolean(),
    }),
    photo_siege: joi.string(),
    prix: joi.number().min(0).max(50000),
  });

  return {
    siegeCreate: siegeCreate.validate(body),
    siegeUpdate: siegeUpdate.validate(body),
  };
}
