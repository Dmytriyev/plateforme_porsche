import joi from "joi";
export default function photo_voiture_actuelValidation(body) {
  const photo_voiture_actuelCreate = joi.object({
    name: joi.string().required(),
    alt: joi.string().required(),
    model_porsche_actuel: joi.string().hex().length(24), // Many-to-One: un seul model_porsche_actuel
  });
  const photo_voiture_actuelUpdate = joi.object({
    name: joi.string(),
    alt: joi.string(),
    model_porsche_actuel: joi.string().hex().length(24), // Many-to-One: un seul model_porsche_actuel
  });
  return {
    photo_voiture_actuelCreate: photo_voiture_actuelCreate.validate(body),
    photo_voiture_actuelUpdate: photo_voiture_actuelUpdate.validate(body),
  };
}
