import joi from "joi";

const mongoIdSchema = () => joi.string().hex().length(24);

const createSchema = joi.object({
  type_model: joi.string().required().max(300),
  type_carrosserie: joi.string().required().max(150),
  annee_production: joi.date().required().max("now"),
  info_moteur: joi.string().max(500),
  info_transmission: joi.string().max(100),
  numero_win: joi.string().uppercase().max(17),
  couleur_interieur: mongoIdSchema(),
  couleur_exterieur: mongoIdSchema(),
  taille_jante: mongoIdSchema(),
  user: mongoIdSchema(),
});

const updateSchema = joi.object({
  type_model: joi.string(),
  type_carrosserie: joi.string(),
  annee_production: joi.date().max("now"),
  info_moteur: joi.string(),
  info_transmission: joi.string(),
  numero_win: joi.string().uppercase(),
  couleur_interieur: mongoIdSchema(),
  couleur_exterieur: mongoIdSchema(),
  taille_jante: mongoIdSchema(),
});

const addOrRemoveImageSchema = joi.object({
  photo_voiture_actuel: joi
    .array()
    .items(mongoIdSchema().required())
    .min(1)
    .required(),
});

const setCouleurSchema = joi.object({
  couleur_exterieur: mongoIdSchema(),
  couleur_interieur: mongoIdSchema(),
  taille_jante: mongoIdSchema(),
});

export default function model_porsche_actuelValidation(body) {
  return {
    model_porsche_actuelCreate: createSchema.validate(body),
    model_porsche_actuelUpdate: updateSchema.validate(body),
    model_porsche_actuelAddOrRemoveImage: addOrRemoveImageSchema.validate(body),
    model_porsche_actuelSetCouleur: setCouleurSchema.validate(body),
  };
}
