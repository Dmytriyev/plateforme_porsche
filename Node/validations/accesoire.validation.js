import joi from "joi";

export default function accesoireValidation(body) {
  const accesoireCreate = joi.object({
    type_accesoire: joi.string().required(),
    nom_accesoire: joi.string().required(),
    description: joi.string().required(),
    prix: joi.number().min(0).required(),
    couleur_accesoire: joi.string().hex().length(24),
    photo_accesoire: joi.array().items(joi.string().hex().length(24)),
  });

  const accesoireUpdate = joi.object({
    type_accesoire: joi.string(),
    nom_accesoire: joi.string(),
    description: joi.string(),
    prix: joi.number().min(0),
    couleur_accesoire: joi.string().hex().length(24),
  });

  const accessoireAddOrRemoveImage = joi.object({
    photo_accesoire: joi
      .array()
      .items(joi.string().hex().length(24))
      .required(),
  });

  const accessoireSetCouleur = joi.object({
    couleur_accesoire: joi.string().hex().length(24).required(),
  });

  return {
    accesoireCreate: accesoireCreate.validate(body),
    accesoireUpdate: accesoireUpdate.validate(body),
    accessoireAddOrRemoveImage: accessoireAddOrRemoveImage.validate(body),
    accessoireSetCouleur: accessoireSetCouleur.validate(body),
  };
}
