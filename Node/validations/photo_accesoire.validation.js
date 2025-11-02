import joi from "joi";
export default function photo_accesoireValidation(body) {
  const photo_accesoireCreate = joi.object({
    name: joi.string().required(),
    alt: joi.string().required(),
    accesoire: joi.string().hex().length(24).required(), // Many-to-One: un seul accesoire
  });
  const photo_accesoireUpdate = joi.object({
    name: joi.string(),
    alt: joi.string(),
    accesoire: joi.string().hex().length(24), // Many-to-One: un seul accesoire
  });
  return {
    photo_accesoireCreate: photo_accesoireCreate.validate(body),
    photo_accesoireUpdate: photo_accesoireUpdate.validate(body),
  };
}
