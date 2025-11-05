import joi from "joi";

export default function couleur_exterieurValidation(body) {
  const couleur_exterieurCreate = joi.object({
    nom_couleur: joi.string().required().max(100),
    photo_couleur: joi.string(),
    description: joi.string().max(500),
    prix: joi.number().min(0).max(100000),
  });

  const couleur_exterieurUpdate = joi.object({
    nom_couleur: joi.string(),
    photo_couleur: joi.string(),
    description: joi.string(),
    prix: joi.number().min(0),
  });

  return {
    couleur_exterieurCreate: couleur_exterieurCreate.validate(body),
    couleur_exterieurUpdate: couleur_exterieurUpdate.validate(body),
  };
}
