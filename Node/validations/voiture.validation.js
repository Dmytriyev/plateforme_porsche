import joi from "joi";

export default function voitureValidation(body) {
  const voitureCreate = joi.object({
    type_voiture: joi.boolean().required().messages({
      "boolean.base": "type_voiture doit être un booléen",
      "any.required": "type_voiture est requis",
    }),
    nom_model: joi.string().required().messages({
      "string.base": "nom_model doit être une chaîne de caractères",
      "string.empty": "nom_model ne peut pas être vide",
      "any.required": "nom_model est requis",
    }),
    description: joi.string().required().messages({
      "string.base": "description doit être une chaîne de caractères",
      "string.empty": "description ne peut pas être vide",
      "any.required": "description est requise",
    }),
    prix: joi.number().min(0).messages({
      "number.base": "prix doit être un nombre",
      "number.min": "prix ne peut pas être négatif",
    }),
    photo_voiture: joi.array().items(joi.string().hex().length(24)).messages({
      "array.base": "photo_voiture doit être un tableau",
      "string.hex": "Chaque photo_voiture doit être un ID hexadécimal valide",
      "string.length": "Chaque photo_voiture doit contenir 24 caractères",
    }),
  });

  const voitureUpdate = joi.object({
    type_voiture: joi.boolean().messages({
      "boolean.base": "type_voiture doit être un booléen",
    }),
    nom_model: joi.string().messages({
      "string.base": "nom_model doit être une chaîne de caractères",
      "string.empty": "nom_model ne peut pas être vide",
    }),
    description: joi.string().messages({
      "string.base": "description doit être une chaîne de caractères",
      "string.empty": "description ne peut pas être vide",
    }),
    prix: joi.number().min(0).messages({
      "number.base": "prix doit être un nombre",
      "number.min": "prix ne peut pas être négatif",
    }),
    photo_voiture: joi.array().items(joi.string().hex().length(24)).messages({
      "array.base": "photo_voiture doit être un tableau",
      "string.hex": "Chaque photo_voiture doit être un ID hexadécimal valide",
      "string.length": "Chaque photo_voiture doit contenir 24 caractères",
    }),
  });

  const voitureAddOrRemoveImage = joi.object({
    photo_voiture: joi
      .array()
      .items(joi.string().hex().length(24).required())
      .required()
      .messages({
        "array.base": "photo_voiture doit être un tableau",
        "any.required": "photo_voiture est requis",
        "string.hex": "Chaque photo_voiture doit être un ID hexadécimal valide",
        "string.length": "Chaque photo_voiture doit contenir 24 caractères",
      }),
  });

  return {
    voitureCreate: voitureCreate.validate(body),
    voitureUpdate: voitureUpdate.validate(body),
    voitureAddOrRemoveImage: voitureAddOrRemoveImage.validate(body),
  };
}
