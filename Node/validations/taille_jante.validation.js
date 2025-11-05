import joi from "joi";

export default function taille_janteValidation(body) {
  const taille_janteCreate = joi.object({
    taille_jante: joi.string().min(0).required(),
    couleur_jante: joi.string().max(100),
    photo_jante: joi.string(),
    description: joi.string().max(500),
    prix: joi.number().min(0),
  });

  const taille_janteUpdate = joi.object({
    taille_jante: joi.string().min(0),
    couleur_jante: joi.string(),
    photo_jante: joi.string(),
    description: joi.string(),
    prix: joi.number().min(0),
  });

  return {
    taille_janteCreate: taille_janteCreate.validate(body),
    taille_janteUpdate: taille_janteUpdate.validate(body),
  };
}
