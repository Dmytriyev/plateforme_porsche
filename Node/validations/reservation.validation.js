import joi from "joi";

export default function reservationValidation(body) {
  const reservationCreate = joi.object({
    date_reservation: joi.date().required().greater("now"),
    status: joi.boolean(),
    user: joi.forbidden(), // Empêcher la création avec un user spécifique
    model_porsche: joi.string().hex().length(24).required(),
  });

  const reservationUpdate = joi.object({
    date_reservation: joi.date(),
    status: joi.boolean(),
    user: joi.forbidden(), // Empêcher la modification du propriétaire
    model_porsche: joi.string().hex().length(24),
  });

  return {
    reservationCreate: reservationCreate.validate(body),
    reservationUpdate: reservationUpdate.validate(body),
  };
}
