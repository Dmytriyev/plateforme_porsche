import joi from "joi";

export default function accesoireValidation(body) {
  const accesoireCreate = joi.object({
    type_accesoire: joi.string().required().messages({
      "string.base": "type_accesoire doit être une chaîne de caractères",
      "string.empty": "type_accesoire ne peut pas être vide",
      "any.required": "type_accesoire est requis",
    }),
    nom_accesoire: joi.string().required().messages({
      "string.base": "nom_accesoire doit être une chaîne de caractères",
      "string.empty": "nom_accesoire ne peut pas être vide",
      "any.required": "nom_accesoire est requis",
    }),
    description: joi.string().required().messages({
      "string.base": "description doit être une chaîne de caractères",
      "string.empty": "description ne peut pas être vide",
      "any.required": "description est requise",
    }),
    prix: joi.number().min(0).required().messages({
      "number.base": "prix doit être un nombre",
      "number.min": "prix ne peut pas être négatif",
      "any.required": "prix est requis",
    }),
    couleur_accesoire: joi.string().hex().length(24).messages({
      "string.hex": "couleur_accesoire doit être un ID hexadécimal valide",
      "string.length": "couleur_accesoire doit contenir 24 caractères",
    }),
    photo_accesoire: joi.array().items(joi.string().hex().length(24)).messages({
      "array.base": "photo_accesoire doit être un tableau",
      "string.hex": "Chaque photo_accesoire doit être un ID hexadécimal valide",
      "string.length": "Chaque photo_accesoire doit contenir 24 caractères",
    }),
  });

  const accesoireUpdate = joi.object({
    type_accesoire: joi.string().messages({
      "string.base": "type_accesoire doit être une chaîne de caractères",
      "string.empty": "type_accesoire ne peut pas être vide",
    }),
    nom_accesoire: joi.string().messages({
      "string.base": "nom_accesoire doit être une chaîne de caractères",
      "string.empty": "nom_accesoire ne peut pas être vide",
    }),
    description: joi.string().messages({
      "string.base": "description doit être une chaîne de caractères",
      "string.empty": "description ne peut pas être vide",
    }),
    prix: joi.number().min(0).messages({
      "number.base": "prix doit être un nombre",
      "number.min": "prix ne peut pas être négatif",
    }),
    couleur_accesoire: joi.string().hex().length(24).messages({
      "string.hex": "couleur_accesoire doit être un ID hexadécimal valide",
      "string.length": "couleur_accesoire doit contenir 24 caractères",
    }),
  });

  const accessoireAddOrRemoveImage = joi.object({
    photo_accesoire: joi
      .array()
      .items(joi.string().hex().length(24).required())
      .required()
      .messages({
        "array.base": "photo_accesoire doit être un tableau",
        "any.required": "photo_accesoire est requis",
        "string.hex":
          "Chaque photo_accesoire doit être un ID hexadécimal valide",
        "string.length": "Chaque photo_accesoire doit contenir 24 caractères",
      }),
  });

  const accessoireSetCouleur = joi.object({
    couleur_accesoire: joi.string().hex().length(24).required().messages({
      "string.hex": "couleur_accesoire doit être un ID hexadécimal valide",
      "string.length": "couleur_accesoire doit contenir 24 caractères",
      "any.required": "couleur_accesoire est requis",
    }),
  });

  return {
    accesoireCreate: accesoireCreate.validate(body),
    accesoireUpdate: accesoireUpdate.validate(body),
    accessoireAddOrRemoveImage: accessoireAddOrRemoveImage.validate(body),
    accessoireSetCouleur: accessoireSetCouleur.validate(body),
  };
}
