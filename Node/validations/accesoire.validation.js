import joi from "joi";

export default function accesoireValidation(body) {
  const accesoireCreate = joi.object({
    type_accesoire: joi.string().required(),
    nom: joi.string().required(),
    description: joi.string().required(),
    prix: joi.number().min(0).required(),
  });

  const accesoireUpdate = joi.object({
    type_accesoire: joi.string(),
    nom: joi.string(),
    description: joi.string(),
    prix: joi.number().min(0),
  });

  return {
    accesoireCreate: accesoireCreate.validate(body),
    accesoireUpdate: accesoireUpdate.validate(body),
  };
}
