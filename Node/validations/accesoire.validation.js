import joi from "joi";

export default function accesoireValidation(body) {
  const accesoireCreate = joi.object({
    type_accesoire: joi.string().required(),
    nom_accesoire: joi.string().required(),
    description: joi.string().required(),
    prix: joi.number().required(),
    couleur_accesoire: joi.string().hex().length(24),
  });

  const accesoireUpdate = joi.object({
    type_accesoire: joi.string(),
    nom_accesoire: joi.string(),
    description: joi.string(),
    prix: joi.number(),
    couleur_accesoire: joi.string().hex().length(24),
  });

  return {
    accesoireCreate: accesoireCreate.validate(body),
    accesoireUpdate: accesoireUpdate.validate(body),
  };
}
