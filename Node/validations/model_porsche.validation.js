import joi from "joi";

export default function model_porscheValidation(body) {
  const model_porscheCreate = joi.object({
    nom_model: joi.string().required(),
    type_carrosserie: joi.string().required(),
    annee_production: joi.date(),
    info_moteur: joi.string().required(),
    info_puissance: joi.number().min(0).required(),
    info_transmission: joi.string().required(),
    info_acceleration: joi.number().min(0).required(),
    info_vitesse_max: joi.number().min(0).required(),
    info_consommation: joi.number().min(0).required(),
    numero_win: joi.string().required(),
    concessionnaire: joi.string(),
    description: joi.string().required(),
    acompte: joi.number().min(0),
    prix: joi.number().min(0),
    voiture: joi.string().hex().length(24).required(),
    couleur_exterieur: joi.string().hex().length(24),
    couleur_interieur: joi.array().items(joi.string().hex().length(24)),
    taille_jante: joi.string().hex().length(24),
    photo_porsche: joi.array().items(joi.string().hex().length(24)),
  });

  const model_porscheUpdate = joi.object({
    nom_model: joi.string(),
    type_carrosserie: joi.string(),
    annee_production: joi.date(),
    info_moteur: joi.string(),
    info_puissance: joi.number().min(0),
    info_transmission: joi.string(),
    info_acceleration: joi.number().min(0),
    info_vitesse_max: joi.number().min(0),
    info_consommation: joi.number().min(0),
    numero_win: joi.string(),
    concessionnaire: joi.string(),
    description: joi.string(),
    acompte: joi.number().min(0),
    prix: joi.number().min(0),
    voiture: joi.string().hex().length(24),
    couleur_exterieur: joi.string().hex().length(24),
    couleur_interieur: joi.array().items(joi.string().hex().length(24)),
    taille_jante: joi.string().hex().length(24),
  });

  const model_porscheAddOrRemoveImage = joi.object({
    photo_porsche: joi.array().items(joi.string().hex().length(24)).required(),
  });

  return {
    model_porscheCreate: model_porscheCreate.validate(body),
    model_porscheUpdate: model_porscheUpdate.validate(body),
    model_porscheAddOrRemoveImage: model_porscheAddOrRemoveImage.validate(body),
  };
}
