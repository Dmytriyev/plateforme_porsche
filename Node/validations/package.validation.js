import joi from "joi";

export default function packageValidation(body) {
  const packageCreate = joi.object({
    nom_package: joi.string().max(150).required(),
    description: joi.string().max(1000).required(),
    prix: joi.number().min(0).max(100000),
    photo_package: joi.string(),
    disponible: joi.boolean(),
  });

  const packageUpdate = joi.object({
    nom_package: joi.string().max(150),
    description: joi.string().max(1000),
    prix: joi.number().min(0).max(100000),
    photo_package: joi.string(),
    disponible: joi.boolean(),
  });

  return {
    packageCreate: packageCreate.validate(body),
    packageUpdate: packageUpdate.validate(body),
  };
}
