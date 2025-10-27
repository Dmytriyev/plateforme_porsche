import joi from "joi";

export default function voitureValidation(body) {
  const voitureCreate = joi.object({
    type_voiture: joi.boolean().required(),
    type_model: joi.string().required(),
    concessionnaire: joi.string(),
    acompte: joi.number().min(0),
    prix: joi.number().min(0),
  });

  const voitureUpdate = joi.object({
    type_voiture: joi.boolean(),
    type_model: joi.string(),
    concessionnaire: joi.string(),
    acompte: joi.number().min(0),
    prix: joi.number().min(0),
  });
  const voitureAddOrRemoveImage = joi.object({
    photo_voiture: joi.array().items(joi.string().hex().length(24)),
  });

  return {
    voitureCreate: voitureCreate.validate(body),
    voitureUpdate: voitureUpdate.validate(body),
    voitureAddOrRemoveImage: voitureAddOrRemoveImage.validate(body),
  };
}
