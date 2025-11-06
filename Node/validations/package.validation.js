/*
 packages/options (nom, description, prix, image).
*/
import joi from "joi";
import { TYPES_PACKAGE } from "../utils/package.constants.js";

export default function packageValidation(body) {
  const packageCreate = joi.object({
    nom_package: joi
      .string()
      .valid(...TYPES_PACKAGE)
      .required(),
    description: joi.string().max(1000).required(),
    prix: joi.number().min(0).max(100000),
    photo_package: joi.string(),
    disponible: joi.boolean(),
  });

  const packageUpdate = joi.object({
    nom_package: joi.string().valid(...TYPES_PACKAGE),
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
