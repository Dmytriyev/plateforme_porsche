import joi from "joi";

export default function couleur_exterieurValidation(body) {
  const couleur_exterieurCreate = joi.object({
    nom_couleur: joi.string().required(),
    photo_couleur: joi.string().required(),
    description: joi.string(),
    photo_voiture: joi.string().hex().length(24),
  });

  const couleur_exterieurUpdate = joi.object({
    nom_couleur: joi.string(),
    photo_couleur: joi.string(),
    description: joi.string(),
    photo_voiture: joi.string().hex().length(24),
  });

  return {
    couleur_exterieurCreate: couleur_exterieurCreate.validate(body),
    couleur_exterieurUpdate: couleur_exterieurUpdate.validate(body),
  };
}
