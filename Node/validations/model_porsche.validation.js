import joi from "joi";

export default function model_porscheValidation(body) {
  const model_porscheCreate = joi.object({
    nom_model: joi.string().required().messages({
      "string.base": "nom_model doit être une chaîne de caractères",
      "string.empty": "nom_model ne peut pas être vide",
      "any.required": "nom_model est requis",
    }),
    type_carrosserie: joi.string().required().messages({
      "string.base": "type_carrosserie doit être une chaîne de caractères",
      "string.empty": "type_carrosserie ne peut pas être vide",
      "any.required": "type_carrosserie est requis",
    }),
    annee_production: joi.date().required().messages({
      "date.base": "annee_production doit être une date valide",
      "any.required": "annee_production est requis",
    }),
    info_moteur: joi.string().required().messages({
      "string.base": "info_moteur doit être une chaîne de caractères",
      "string.empty": "info_moteur ne peut pas être vide",
      "any.required": "info_moteur est requis",
    }),
    info_puissance: joi.number().required().messages({
      "number.base": "info_puissance doit être un nombre",
      "any.required": "info_puissance est requis",
    }),
    info_transmission: joi.string().required().messages({
      "string.base": "info_transmission doit être une chaîne de caractères",
      "string.empty": "info_transmission ne peut pas être vide",
      "any.required": "info_transmission est requis",
    }),
    info_acceleration: joi.number().required().messages({
      "number.base": "info_acceleration doit être un nombre",
      "any.required": "info_acceleration est requis",
    }),
    info_vitesse_max: joi.number().required().messages({
      "number.base": "info_vitesse_max doit être un nombre",
      "any.required": "info_vitesse_max est requis",
    }),
    info_consommation: joi.number().required().messages({
      "number.base": "info_consommation doit être un nombre",
      "any.required": "info_consommation est requis",
    }),
    numero_win: joi.string().required().messages({
      "string.base": "numero_win doit être une chaîne de caractères",
      "string.empty": "numero_win ne peut pas être vide",
      "any.required": "numero_win est requis",
    }),
    concessionnaire: joi.string().messages({
      "string.base": "concessionnaire doit être une chaîne de caractères",
    }),
    description: joi.string().required().messages({
      "string.base": "description doit être une chaîne de caractères",
      "string.empty": "description ne peut pas être vide",
      "any.required": "description est requise",
    }),
    acompte: joi.number().min(0).messages({
      "number.base": "acompte doit être un nombre",
      "number.min": "acompte ne peut pas être négatif",
    }),
    prix: joi.number().min(0).messages({
      "number.base": "prix doit être un nombre",
      "number.min": "prix ne peut pas être négatif",
    }),
    voiture: joi.string().hex().length(24).required().messages({
      "string.hex": "voiture doit être un ID hexadécimal valide",
      "string.length": "voiture doit contenir 24 caractères",
      "any.required": "voiture est requis",
    }),
    couleur_exterieur: joi.string().hex().length(24).messages({
      "string.hex": "couleur_exterieur doit être un ID hexadécimal valide",
      "string.length": "couleur_exterieur doit contenir 24 caractères",
    }),
    couleur_interieur: joi
      .array()
      .items(joi.string().hex().length(24))
      .messages({
        "array.base": "couleur_interieur doit être un tableau",
        "string.hex":
          "Chaque couleur_interieur doit être un ID hexadécimal valide",
        "string.length": "Chaque couleur_interieur doit contenir 24 caractères",
      }),
    taille_jante: joi.string().hex().length(24).messages({
      "string.hex": "taille_jante doit être un ID hexadécimal valide",
      "string.length": "taille_jante doit contenir 24 caractères",
    }),
    photo_porsche: joi.array().items(joi.string().hex().length(24)).messages({
      "array.base": "photo_porsche doit être un tableau",
      "string.hex": "Chaque photo_porsche doit être un ID hexadécimal valide",
      "string.length": "Chaque photo_porsche doit contenir 24 caractères",
    }),
  });

  const model_porscheUpdate = joi.object({
    nom_model: joi.string().messages({
      "string.base": "nom_model doit être une chaîne de caractères",
      "string.empty": "nom_model ne peut pas être vide",
    }),
    type_carrosserie: joi.string().messages({
      "string.base": "type_carrosserie doit être une chaîne de caractères",
      "string.empty": "type_carrosserie ne peut pas être vide",
    }),
    annee_production: joi.date().messages({
      "date.base": "annee_production doit être une date valide",
    }),
    info_moteur: joi.string().messages({
      "string.base": "info_moteur doit être une chaîne de caractères",
      "string.empty": "info_moteur ne peut pas être vide",
    }),
    info_puissance: joi.number().messages({
      "number.base": "info_puissance doit être un nombre",
    }),
    info_transmission: joi.string().messages({
      "string.base": "info_transmission doit être une chaîne de caractères",
      "string.empty": "info_transmission ne peut pas être vide",
    }),
    info_acceleration: joi.number().messages({
      "number.base": "info_acceleration doit être un nombre",
    }),
    info_vitesse_max: joi.number().messages({
      "number.base": "info_vitesse_max doit être un nombre",
    }),
    info_consommation: joi.number().messages({
      "number.base": "info_consommation doit être un nombre",
    }),
    numero_win: joi.string().messages({
      "string.base": "numero_win doit être une chaîne de caractères",
      "string.empty": "numero_win ne peut pas être vide",
    }),
    concessionnaire: joi.string().messages({
      "string.base": "concessionnaire doit être une chaîne de caractères",
    }),
    description: joi.string().messages({
      "string.base": "description doit être une chaîne de caractères",
      "string.empty": "description ne peut pas être vide",
    }),
    acompte: joi.number().min(0).messages({
      "number.base": "acompte doit être un nombre",
      "number.min": "acompte ne peut pas être négatif",
    }),
    prix: joi.number().min(0).messages({
      "number.base": "prix doit être un nombre",
      "number.min": "prix ne peut pas être négatif",
    }),
    voiture: joi.string().hex().length(24).messages({
      "string.hex": "voiture doit être un ID hexadécimal valide",
      "string.length": "voiture doit contenir 24 caractères",
    }),
    couleur_exterieur: joi.string().hex().length(24).messages({
      "string.hex": "couleur_exterieur doit être un ID hexadécimal valide",
      "string.length": "couleur_exterieur doit contenir 24 caractères",
    }),
    couleur_interieur: joi
      .array()
      .items(joi.string().hex().length(24))
      .messages({
        "array.base": "couleur_interieur doit être un tableau",
        "string.hex":
          "Chaque couleur_interieur doit être un ID hexadécimal valide",
        "string.length": "Chaque couleur_interieur doit contenir 24 caractères",
      }),
    taille_jante: joi.string().hex().length(24).messages({
      "string.hex": "taille_jante doit être un ID hexadécimal valide",
      "string.length": "taille_jante doit contenir 24 caractères",
    }),
  });

  const model_porscheAddOrRemoveImage = joi.object({
    photo_porsche: joi
      .array()
      .items(joi.string().hex().length(24).required())
      .required()
      .messages({
        "array.base": "photo_porsche doit être un tableau",
        "any.required": "photo_porsche est requis",
        "string.hex": "Chaque photo_porsche doit être un ID hexadécimal valide",
        "string.length": "Chaque photo_porsche doit contenir 24 caractères",
      }),
  });

  return {
    model_porscheCreate: model_porscheCreate.validate(body),
    model_porscheUpdate: model_porscheUpdate.validate(body),
    model_porscheAddOrRemoveImage: model_porscheAddOrRemoveImage.validate(body),
  };
}
