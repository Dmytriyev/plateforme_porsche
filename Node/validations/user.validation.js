import joi from "joi";

export default function userValidation(body) {
  const userCreate = joi.object({
    email: joi.string().email().required(),
    password: joi
      .string()
      .required()
      .min(8)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      )
      .messages({
        "string.pattern.base":
          "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)",
        "string.min": "Le mot de passe doit contenir au moins 8 caractères",
      }),
    nom: joi.string().required(),
    prenom: joi.string().required(),
    telephone: joi
      .string()
      .pattern(/^[0-9]{10,13}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Le numéro de téléphone doit contenir entre 10 et 13 chiffres",
      }),
    adresse: joi.string().required(),
    code_postal: joi
      .string()
      .pattern(/^[0-9]{5}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Le code postal doit contenir exactement 5 chiffres",
      }),
    // isAdmin et role sont gérés côté serveur, pas dans la validation utilisateur
    // panier est créé automatiquement lors de l'inscription
  });

  const userUpdate = joi.object({
    email: joi.string().email(),
    password: joi
      .string()
      .min(8)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      )
      .messages({
        "string.pattern.base":
          "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)",
        "string.min": "Le mot de passe doit contenir au moins 8 caractères",
      }),
    nom: joi.string(),
    prenom: joi.string(),
    telephone: joi
      .string()
      .pattern(/^[0-9]{10,13}$/)
      .messages({
        "string.pattern.base":
          "Le numéro de téléphone doit contenir entre 10 et 13 chiffres",
      }),
    adresse: joi.string(),
    code_postal: joi
      .string()
      .pattern(/^[0-9]{5}$/)
      .messages({
        "string.pattern.base":
          "Le code postal doit contenir exactement 5 chiffres",
      }),
    // isAdmin, role, et panier ne peuvent pas être modifiés directement
  });

  const userLogin = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
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
    couleur_exterieur: joi.string().hex().length(24),
    couleur_interieur: joi.string().hex().length(24),
  });

  return {
    userCreate: userCreate.validate(body),
    userUpdate: userUpdate.validate(body),
    userLogin: userLogin.validate(body),
    userReservation: userReservation.validate(body),
    userPorsche: userPorsche.validate(body),
  };
}
