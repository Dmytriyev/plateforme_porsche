import joi from "joi";

export default function taille_janteValidation(body) {
  const taille_janteCreate = joi.object({
    taille_jante: joi.string().min(0).required(),
    photo_couleur: joi.string().required(),
    couleur_jante: joi.string().required(),
    description: joi.string(),
  });

  const taille_janteUpdate = joi.object({
    taille_jante: joi.string().min(0),
    photo_couleur: joi.string(),
    couleur_jante: joi.string(),
    description: joi.string(),
  });

  return {
    taille_janteCreate: taille_janteCreate.validate(body),
    taille_janteUpdate: taille_janteUpdate.validate(body),
  };
}
