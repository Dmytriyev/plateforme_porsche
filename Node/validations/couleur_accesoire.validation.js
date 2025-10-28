import joi from "joi";

export default function couleur_accesoireValidation(body) {
  const couleur_accesoireCreate = joi.object({
    nom_couleur: joi.string().required(),
    photo_couleur: joi.string().required(),
  });

  const couleur_accesoireUpdate = joi.object({
    nom_couleur: joi.string(),
    photo_couleur: joi.string(),
  });

  return {
    couleur_accesoireCreate: couleur_accesoireCreate.validate(body),
    couleur_accesoireUpdate: couleur_accesoireUpdate.validate(body),
  };
}
