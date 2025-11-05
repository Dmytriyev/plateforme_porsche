import joi from "joi";

export default function siegeValidation(body) {
  const siegeCreate = joi.object({
    nom_siege: joi.string().max(150).required(),
    description: joi.string().max(1000),
    options_confort: joi.object({
      ventilation: joi.boolean(),
      chauffage: joi.boolean(),
    }),
    photo_siege: joi.string(),
    prix: joi.number().min(0).max(50000),
  });

  const siegeUpdate = joi.object({
    nom_siege: joi.string().max(150),
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
