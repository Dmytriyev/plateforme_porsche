import joi from "joi";

export default function reservationValidation(body) {
  const reservationCreate = joi.object({
    date_reservation: joi.date().required(),
    status: joi.boolean().required(),
    user: joi.string().hex().length(24),
    voiture: joi.string().hex().length(24),
  });

  const reservationUpdate = joi.object({
    date_reservation: joi.date(),
    status: joi.boolean(),
    user: joi.string().hex().length(24),
    voiture: joi.string().hex().length(24),
  });

  return {
    reservationCreate: reservationCreate.validate(body),
    reservationUpdate: reservationUpdate.validate(body),
  };
}
