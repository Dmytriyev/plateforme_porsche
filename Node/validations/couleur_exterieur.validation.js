import joi from "joi";

export default function couleur_exterieurValidation(body) {
  const couleur_exterieurCreate = joi.object({
    nom_couleur: joi.string().required(),
    photo_couleur: joi.string(),
    description: joi.string(),
  });

  const couleur_exterieurUpdate = joi.object({
    nom_couleur: joi.string(),
    photo_couleur: joi.string(),
    description: joi.string(),
  });

  return {
    couleur_exterieurCreate: couleur_exterieurCreate.validate(body),
    couleur_exterieurUpdate: couleur_exterieurUpdate.validate(body),
  };
}
