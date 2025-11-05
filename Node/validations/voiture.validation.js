import joi from "joi";

export default function voitureValidation(body) {
  const voitureCreate = joi.object({
    type_voiture: joi.boolean().required(),
    nom_model: joi.string().required().max(250),
    description: joi.string().required().max(1000),
    prix: joi.number().min(0),
    photo_voiture: joi.array().items(joi.string().hex().length(24)),
  });

  const voitureUpdate = joi.object({
    type_voiture: joi.boolean(),
    nom_model: joi.string(),
    description: joi.string(),
    prix: joi.number().min(0),
    photo_voiture: joi.array().items(joi.string().hex().length(24)),
  });

  const voitureAddOrRemoveImage = joi.object({
    photo_voiture: joi.array().items(joi.string().hex().length(24)).required(),
  });

  return {
    voitureCreate: voitureCreate.validate(body),
    voitureUpdate: voitureUpdate.validate(body),
    voitureAddOrRemoveImage: voitureAddOrRemoveImage.validate(body),
  };
}
