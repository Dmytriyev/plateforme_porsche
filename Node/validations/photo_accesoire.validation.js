import joi from "joi";
export default function photo_accesoireValidation(body) {
  const photo_accesoireCreate = joi.object({
    name: joi.string().required().max(250),
    alt: joi.string().max(250),
    accesoire: joi.string().hex().length(24).required(), // Many-to-One: un seul accesoire
    couleur_accesoire: joi.string().hex().length(24), // Many-to-One: couleur spécifique
  });
  const photo_accesoireUpdate = joi.object({
    name: joi.string(),
    alt: joi.string(),
    accesoire: joi.string().hex().length(24), // Many-to-One: un seul accesoire
    couleur_accesoire: joi.string().hex().length(24), // Many-to-One: couleur spécifique
  });
  return {
    photo_accesoireCreate: photo_accesoireCreate.validate(body),
    photo_accesoireUpdate: photo_accesoireUpdate.validate(body),
  };
}
