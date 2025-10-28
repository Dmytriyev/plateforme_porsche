import joi from "joi";

export default function model_porsche_actuelValidation(body) {
  const model_porsche_actuelCreate = joi.object({
    type_model: joi.string().required(),
    type_carrosserie: joi.string().required(),
    annee_production: joi.date().required(),
    info_moteur: joi.string(),
    info_transmission: joi.string(),
    numero_win: joi.string(),
    user: joi.string().hex().length(24),
    couleur_interieur: joi.string().hex().length(24),
    couleur_exterieur: joi.string().hex().length(24),
  });

  const model_porsche_actuelUpdate = joi.object({
    type_model: joi.string(),
    type_carrosserie: joi.string(),
    annee_production: joi.date(),
    info_moteur: joi.string(),
    info_transmission: joi.string(),
    numero_win: joi.string(),
    couleur_interieur: joi.string().hex().length(24),
    couleur_exterieur: joi.string().hex().length(24),
  });

  const model_porsche_actuelAddOrRemoveImage = joi.object({
    photo_voiture_actuels: joi.array().items(joi.string().hex().length(24)),
  });
  return {
    model_porsche_actuelCreate: model_porsche_actuelCreate.validate(body),
    model_porsche_actuelUpdate: model_porsche_actuelUpdate.validate(body),
    model_porsche_actuelAddOrRemoveImage:
      model_porsche_actuelAddOrRemoveImage.validate(body),
  };
}
