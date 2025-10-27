import joi from "joi";
export default function photo_voitureValidation(body) {
  const photo_voitureCreate = joi.object({
    name: joi.string().required(),
    alt: joi.string().required(),
  });
  const photo_voitureUpdate = joi.object({
    name: joi.string(),
    alt: joi.string(),
  });
  return {
    photo_voitureCreate: photo_voitureCreate.validate(body),
    photo_voitureUpdate: photo_voitureUpdate.validate(body),
  };
}
