import { AVAILABLE_ROLES } from "../utils/roles.constants.js";
import joi from "joi";

export default function userValidation(body) {
  const mongoIdSchema = () => joi.string().hex().length(24);

  const userCreate = joi.object({
    email: joi.string().email().required().max(150).min(5),
    password: joi
      .string()
      .min(8)
      .max(100)
      // une majuscule, une minuscule, un chiffre et un caractère spécial
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      )
      .required(),
    nom: joi.string().required().max(50).min(2),
    prenom: joi.string().required().max(100).min(2),
    telephone: joi
      .string()
      // numéro de téléphone entre 10 et 13 chiffres
      .pattern(/^[0-9]{10,13}$/)
      .required(),
    adresse: joi.string().required().max(250),
    code_postal: joi
      .string()
      // code postal 5 chiffres
      .pattern(/^[0-9]{5}$/)
      .required(),
  });

  const userUpdate = joi.object({
    email: joi.string().email(),
    password: joi
      .string()
      .min(8)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      ),
    nom: joi.string().max(50).min(2),
    prenom: joi.string().max(100).min(2),
    telephone: joi.string().pattern(/^[0-9]{10,13}$/),
    adresse: joi.string().max(250),
    code_postal: joi.string().pattern(/^[0-9]{5}$/),
  });
  //   userRoleUpdate est séparé pour sécuriser la modification des rôles (admin).
  const userRoleUpdate = joi.object({
    role: joi
      .string()
      .valid(...AVAILABLE_ROLES)
      .required(),
  });

  const userLogin = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  });

  const userReservation = joi.object({
    voiture: mongoIdSchema().required(),
    date_reservation: joi.date().required().greater("now"),
    status: joi.boolean().default(true),
  });

  const userPorsche = joi.object({
    type_model: joi.string().required().max(200),
    type_carrosserie: joi.string().required().max(50),
    annee_production: joi.date().required(),
    info_moteur: joi.string().max(250),
    info_transmission: joi.string().max(100),
    numero_win: joi.string().max(100),
    couleur_exterieur: mongoIdSchema(),
    couleur_interieur: mongoIdSchema(),
  });

  return {
    userCreate: userCreate.validate(body),
    userUpdate: userUpdate.validate(body),
    userRoleUpdate: userRoleUpdate.validate(body),
    userLogin: userLogin.validate(body),
    userReservation: userReservation.validate(body),
    userPorsche: userPorsche.validate(body),
  };
}
