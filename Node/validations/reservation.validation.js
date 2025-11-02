import joi from "joi";

export default function reservationValidation(body) {
  const reservationCreate = joi.object({
    date_reservation: joi.date().required(),
    status: joi.boolean(),
    user: joi.string().hex().length(24), // Many-to-One: un seul user
    voiture: joi.string().hex().length(24), // Many-to-One: une seule voiture
  });

  const reservationUpdate = joi.object({
    date_reservation: joi.date(),
    status: joi.boolean(),
    user: joi.string().hex().length(24), // Many-to-One: un seul user
    voiture: joi.string().hex().length(24), // Many-to-One: une seule voiture
  });

  return {
    reservationCreate: reservationCreate.validate(body),
    reservationUpdate: reservationUpdate.validate(body),
  };
}
