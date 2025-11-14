/*
  - `user` est interdit côté client (sera rempli depuis le token)
  - `date_reservation` doit être dans le futur
*/
import joi from "joi";

export default function reservationValidation(body) {
  const reservationCreate = joi.object({
    date_reservation: joi.date().required().greater("now"),
    status: joi.boolean(),
    // user ne pas fourni par l'utilisateur (fourni depuis le token)
    user: joi.forbidden(),
    model_porsche: joi.string().hex().length(24).required(),
  });

  const reservationUpdate = joi.object({
    date_reservation: joi.date(),
    status: joi.boolean(),
    // Empêcher la modification du propriétaire
    user: joi.forbidden(),
    model_porsche: joi.string().hex().length(24),
  });

  return {
    reservationCreate: reservationCreate.validate(body),
    reservationUpdate: reservationUpdate.validate(body),
  };
}
