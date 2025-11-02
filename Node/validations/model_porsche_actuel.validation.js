import joi from "joi";

export default function model_porsche_actuelValidation(body) {
  const model_porsche_actuelCreate = joi.object({
    type_model: joi.string().required().messages({
      "any.required": "Le type de modèle est requis (ex: 911, Cayenne, Cayman)",
      "string.empty": "Le type de modèle ne peut pas être vide",
    }),
    type_carrosserie: joi.string().required().messages({
      "any.required":
        "Le type de carrosserie est requis (ex: Coupe, Cabriolet, SUV)",
      "string.empty": "Le type de carrosserie ne peut pas être vide",
    }),
    annee_production: joi.date().required().max("now").messages({
      "any.required": "L'année de production est requise",
      "date.max": "L'année de production ne peut pas être dans le futur",
    }),
    info_moteur: joi.string().messages({
      "string.base": "Les informations sur le moteur doivent être une chaîne",
    }),
    info_transmission: joi.string().messages({
      "string.base":
        "Les informations sur la transmission doivent être une chaîne",
    }),
    numero_win: joi.string().uppercase().messages({
      "string.base": "Le numéro WIN doit être une chaîne",
    }),
    couleur_interieur: joi.string().hex().length(24).messages({
      "string.length": "ID de couleur intérieure invalide",
      "string.hex": "ID de couleur intérieure invalide",
    }),
    couleur_exterieur: joi.string().hex().length(24).messages({
      "string.length": "ID de couleur extérieure invalide",
      "string.hex": "ID de couleur extérieure invalide",
    }),
    taille_jante: joi.string().hex().length(24).messages({
      "string.length": "ID de taille de jante invalide",
      "string.hex": "ID de taille de jante invalide",
    }),
    user: joi.string().hex().length(24), // Accepter le champ user (sera auto-assigné dans le contrôleur)
  });

  const model_porsche_actuelUpdate = joi.object({
    type_model: joi.string().messages({
      "string.empty": "Le type de modèle ne peut pas être vide",
    }),
    type_carrosserie: joi.string().messages({
      "string.empty": "Le type de carrosserie ne peut pas être vide",
    }),
    annee_production: joi.date().max("now").messages({
      "date.max": "L'année de production ne peut pas être dans le futur",
    }),
    info_moteur: joi.string(),
    info_transmission: joi.string(),
    numero_win: joi.string().uppercase(),
    couleur_interieur: joi.string().hex().length(24).messages({
      "string.length": "ID de couleur intérieure invalide",
    }),
    couleur_exterieur: joi.string().hex().length(24).messages({
      "string.length": "ID de couleur extérieure invalide",
    }),
    taille_jante: joi.string().hex().length(24).messages({
      "string.length": "ID de taille de jante invalide",
    }),
    // user ne peut pas être modifié
  });

  const model_porsche_actuelAddOrRemoveImage = joi.object({
    photo_voiture_actuel: joi
      .array()
      .items(joi.string().hex().length(24).required())
      .min(1)
      .required()
      .messages({
        "array.min": "Au moins une photo est requise",
        "any.required": "Le tableau de photos est requis",
        "string.length": "ID de photo invalide",
      }),
  });

  const model_porsche_actuelSetCouleur = joi.object({
    couleur_exterieur: joi.string().hex().length(24).messages({
      "string.length": "ID de couleur invalide",
      "string.hex": "ID de couleur invalide",
    }),
    couleur_interieur: joi.string().hex().length(24).messages({
      "string.length": "ID de couleur invalide",
      "string.hex": "ID de couleur invalide",
    }),
    taille_jante: joi.string().hex().length(24).messages({
      "string.length": "ID de jante invalide",
      "string.hex": "ID de jante invalide",
    }),
  });

  return {
    model_porsche_actuelCreate: model_porsche_actuelCreate.validate(body),
    model_porsche_actuelUpdate: model_porsche_actuelUpdate.validate(body),
    model_porsche_actuelAddOrRemoveImage:
      model_porsche_actuelAddOrRemoveImage.validate(body),
    model_porsche_actuelSetCouleur:
      model_porsche_actuelSetCouleur.validate(body),
  };
}
