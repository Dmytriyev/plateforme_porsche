import joi from "joi";

export default function userValidation(body) {
  const userCreate = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required().min(5),
    isAdmin: joi.boolean(),
    role: joi.string(),
    nom: joi.string().required(),
    prenom: joi.string().required(),
    telephone: joi
      .number()
      .regex(/^[0-9]{13}$/)
      .required(),
    adresse: joi.string().required(),
    code_postal: joi
      .number()
      .regex(/^[0-9]{5}$/)
      .required(),
    panier: joi.string().hex().length(24),
  });

  const userUpdate = joi.object({
    email: joi.string().email(),
    password: joi.string().min(5),
    nom: joi.string(),
    prenom: joi.string(),
    telephone: joi.number().regex(/^[0-9]{13}$/),
    adresse: joi.string(),
    code_postal: joi.number().regex(/^[0-9]{5}$/),
    panier: joi.string().hex().length(24),
  });

  const userLogin = joi.object({
    email: joi.string().email(),
    password: joi.string(),
  });

  const userReservation = joi.object({
    voiture: joi.string().hex().length(24).required(),
    date_reservation: joi.date().required(),
    status: joi.boolean().default(true),
  });

  const userPorsche = joi.object({
    type_model: joi.string().required(),
    type_carrosserie: joi.string().required(),
    annee_production: joi.date().required(),
    info_moteur: joi.string(),
    info_transmission: joi.string(),
    numero_win: joi.string(),
  });

  return {
    userCreate: userCreate.validate(body),
    userUpdate: userUpdate.validate(body),
    userLogin: userLogin.validate(body),
    userReservation: userReservation.validate(body),
    userPorsche: userPorsche.validate(body),
  };
}
