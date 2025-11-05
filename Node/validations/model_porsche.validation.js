import joi from "joi";

export default function model_porscheValidation(body) {
  const model_porscheCreate = joi.object({
    nom_model: joi.string().required().max(300),
    type_carrosserie: joi.string().required().max(100),
    annee_production: joi.date(),
    // Prix de base de la VARIANTE (requis)
    prix_base: joi.number().min(0).max(100000000).required(),
    specifications: joi
      .object({
        moteur: joi.string().required().max(150),
        puissance: joi.number().min(0).max(1500).required(),
        couple: joi.number().min(0).max(1500),
        transmission: joi
          .string()
          .required()
          .valid("PDK", "Manuelle", "PDK 8 rapports", "Manuelle 7 vitesses"),
        acceleration_0_100: joi.number().min(0).max(20).required(),
        vitesse_max: joi.number().min(0).max(500).required(),
        consommation: joi.number().min(0).max(50).required(),
        emissions_co2: joi.number().min(0).max(500),
      })
      .required(),
    numero_vin: joi.string().max(17),
    concessionnaire: joi.string().max(400),
    description: joi.string().required().max(2000),
    disponible: joi.boolean(),
    voiture: joi.string().hex().length(24).required(),
    couleur_exterieur: joi.string().hex().length(24),
    couleur_interieur: joi.array().items(joi.string().hex().length(24)),
    taille_jante: joi.string().hex().length(24),
    siege: joi.string().hex().length(24),
    package: joi.string().hex().length(24),
    photo_porsche: joi.array().items(joi.string().hex().length(24)),
  });

  const model_porscheUpdate = joi.object({
    nom_model: joi.string(),
    type_carrosserie: joi.string(),
    annee_production: joi.date(),
    prix_base: joi.number().min(0).max(100000000),
    specifications: joi.object({
      moteur: joi.string().max(150),
      puissance: joi.number().min(0).max(1500),
      couple: joi.number().min(0).max(1500),
      transmission: joi
        .string()
        .valid("PDK", "Manuelle", "PDK 8 rapports", "Manuelle 7 vitesses"),
      acceleration_0_100: joi.number().min(0).max(20),
      vitesse_max: joi.number().min(0).max(500),
      consommation: joi.number().min(0).max(50),
      emissions_co2: joi.number().min(0).max(500),
    }),
    numero_vin: joi.string().max(17),
    concessionnaire: joi.string(),
    description: joi.string(),
    disponible: joi.boolean(),
    voiture: joi.string().hex().length(24),
    couleur_exterieur: joi.string().hex().length(24),
    couleur_interieur: joi.array().items(joi.string().hex().length(24)),
    taille_jante: joi.string().hex().length(24),
    siege: joi.string().hex().length(24),
    package: joi.string().hex().length(24),
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
