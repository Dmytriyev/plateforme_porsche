import joi from "joi";

export default function couleur_interieurValidation(body) {
  const couleur_interieurCreate = joi.object({
    nom_couleur: joi.string().required(),
    photo_couleur: joi.string().required(),
    description: joi.string(),
    photo_voiture: joi.string().hex().length(24),
  });

  const couleur_interieurUpdate = joi.object({
    nom_couleur: joi.string(),
    photo_couleur: joi.string(),
    description: joi.string(),
    photo_voiture: joi.string().hex().length(24),
  });

  return {
    couleur_interieurCreate: couleur_interieurCreate.validate(body),
    couleur_interieurUpdate: couleur_interieurUpdate.validate(body),
  };
}
