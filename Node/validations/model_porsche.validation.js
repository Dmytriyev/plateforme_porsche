import joi from "joi";

export default function model_porscheValidation(body) {
  const model_porscheCreate = joi.object({
    nom_model: joi.string().required(),
    type_carrosserie: joi.string().required(),
    annee_production: joi.date().required(),
    info_moteur: joi.string().required(),
    info_puissance: joi.number().required(),
    info_transmission: joi.string().required(),
    info_acceleration: joi.number().required(),
    info_vitesse_max: joi.number().required(),
    info_consomation: joi.number().required(),
    numero_win: joi.string().required(),
    concessionnaire: joi.string(),
    description: joi.string().required(),
    acompte: joi.number().min(0),
    prix: joi.number().min(0),
    voiture: joi.string().hex().length(24).required(), // Many-to-One: une seule voiture
    couleur_exterieur: joi.string().hex().length(24), // Many-to-One: une seule couleur
    couleur_interieur: joi.array().items(joi.string().hex().length(24)), // Many-to-Many: plusieurs couleurs
    taille_jante: joi.string().hex().length(24), // Many-to-One: une seule taille
  });

  const model_porscheUpdate = joi.object({
    nom_model: joi.string(),
    type_carrosserie: joi.string(),
    annee_production: joi.date(),
    info_moteur: joi.string(),
    info_puissance: joi.number(),
    info_transmission: joi.string(),
    info_acceleration: joi.number(),
    info_vitesse_max: joi.number(),
    info_consomation: joi.number(),
    numero_win: joi.string(),
    concessionnaire: joi.string(),
    description: joi.string(),
    acompte: joi.number().min(0),
    prix: joi.number().min(0),
    voiture: joi.string().hex().length(24), // Many-to-One: une seule voiture
    couleur_exterieur: joi.string().hex().length(24), // Many-to-One: une seule couleur
    couleur_interieur: joi.array().items(joi.string().hex().length(24)), // Many-to-Many: plusieurs couleurs
    taille_jante: joi.string().hex().length(24), // Many-to-One: une seule taille
  });

  const model_porscheAddOrRemoveImage = joi.object({
    photo_porsche: joi
      .array()
      .items(joi.string().hex().length(24).required())
      .required(),
  });

  return {
    model_porscheCreate: model_porscheCreate.validate(body),
    model_porscheUpdate: model_porscheUpdate.validate(body),
    model_porscheAddOrRemoveImage: model_porscheAddOrRemoveImage.validate(body),
  };
}
