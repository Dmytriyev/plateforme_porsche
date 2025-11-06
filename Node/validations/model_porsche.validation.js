/*
  la création et la mise à jour des variantes Model_porsche.
*/
import joi from "joi";
import {
  TYPES_CARROSSERIE,
  TOUTES_VARIANTES,
} from "../utils/model_porsche.constants.js";

export default function model_porscheValidation(body) {
  const mongoIdSchema = () => joi.string().hex().length(24);

  const model_porscheCreate = joi.object({
    nom_model: joi
      .string()
      .required()
      .valid(...TOUTES_VARIANTES)
      .max(300),
    type_carrosserie: joi
      .string()
      .required()
      .valid(...TYPES_CARROSSERIE)
      .max(100),
    annee_production: joi.date(),
    // Prix de base de modèle Porsche
    prix_base: joi.number().min(0).max(100000000).required(),
    specifications: joi
      .object({
        moteur: joi.string().required().max(150),
        puissance: joi.number().min(0).max(1500).required(),
        couple: joi.number().min(0).max(1500),
        transmission: joi.string().required(),
        acceleration_0_100: joi.number().min(0).max(20).required(),
        vitesse_max: joi.number().min(0).max(500).required(),
        consommation: joi.number().min(0).max(50).required(),
      })
      .required(),
    numero_vin: joi.string().max(17),
    concessionnaire: joi.string().max(400),
    description: joi.string().required().max(2000),
    disponible: joi.boolean(),
    voiture: mongoIdSchema().required(),
    couleur_exterieur: mongoIdSchema(),
    couleur_interieur: joi.array().items(mongoIdSchema()),
    taille_jante: mongoIdSchema(),
    siege: mongoIdSchema(),
    package: mongoIdSchema(),
    photo_porsche: joi.array().items(mongoIdSchema()),
  });

  const model_porscheUpdate = joi.object({
    nom_model: joi.string().valid(...TOUTES_VARIANTES),
    type_carrosserie: joi.string().valid(...TYPES_CARROSSERIE),
    annee_production: joi.date(),
    prix_base: joi.number().min(0).max(100000000),
    specifications: joi.object({
      moteur: joi.string().max(150),
      puissance: joi.number().min(0).max(1500),
      couple: joi.number().min(0).max(1500),
      transmission: joi.string(),
      acceleration_0_100: joi.number().min(0).max(20),
      vitesse_max: joi.number().min(0).max(500),
      consommation: joi.number().min(0).max(50),
    }),
    numero_vin: joi.string().max(17),
    concessionnaire: joi.string(),
    description: joi.string(),
    disponible: joi.boolean(),
    voiture: mongoIdSchema().required(),
    couleur_exterieur: mongoIdSchema(),
    couleur_interieur: joi.array().items(mongoIdSchema()),
    taille_jante: mongoIdSchema(),
    siege: mongoIdSchema(),
    package: mongoIdSchema(),
  });

  const model_porscheAddOrRemoveImage = joi.object({
    photo_porsche: joi.array().items(mongoIdSchema()).required(),
  });

  return {
    model_porscheCreate: model_porscheCreate.validate(body),
    model_porscheUpdate: model_porscheUpdate.validate(body),
    model_porscheAddOrRemoveImage: model_porscheAddOrRemoveImage.validate(body),
  };
}
