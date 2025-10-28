import joi from "joi";
export default function photo_voiture_actuelValidation(body) {
  const photo_voiture_actuelCreate = joi.object({
    name: joi.string().required(),
    alt: joi.string().required(),
  });
  const photo_voiture_actuelUpdate = joi.object({
    name: joi.string(),
    alt: joi.string(),
  });
  return {
    photo_voiture_actuelCreate: photo_voiture_actuelCreate.validate(body),
    photo_voiture_actuelUpdate: photo_voiture_actuelUpdate.validate(body),
  };
}
