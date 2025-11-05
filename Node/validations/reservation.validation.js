import joi from "joi";

export default function reservationValidation(body) {
  const reservationCreate = joi.object({
    date_reservation: joi.date().required().greater("now"),
    status: joi.boolean(),
    // SÉCURITÉ: user ne doit PAS être fourni par l'utilisateur (sera forcé depuis le token)
    user: joi.forbidden(),
    voiture: joi.string().hex().length(24).required(),
  });

  const reservationUpdate = joi.object({
    date_reservation: joi.date(),
    status: joi.boolean(),
    // SÉCURITÉ: Empêcher la modification du propriétaire
    user: joi.forbidden(),
    voiture: joi.string().hex().length(24),
  });

  return {
    reservationCreate: reservationCreate.validate(body),
    reservationUpdate: reservationUpdate.validate(body),
  };
}
