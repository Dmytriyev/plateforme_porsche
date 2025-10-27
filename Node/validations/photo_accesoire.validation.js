import joi from "joi";
export default function photo_accesoireValidation(body) {
  const photo_accesoireCreate = joi.object({
    name: joi.string().required(),
    alt: joi.string().required(),
  });
  const photo_accesoireUpdate = joi.object({
    name: joi.string(),
    alt: joi.string(),
  });
  return {
    photo_accesoireCreate: photo_accesoireCreate.validate(body),
    photo_accesoireUpdate: photo_accesoireUpdate.validate(body),
  };
}
