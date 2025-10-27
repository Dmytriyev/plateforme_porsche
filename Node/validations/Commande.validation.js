import joi from "joi";

export default function CommandeValidation(body) {
  const CommandeCreate = joi.object({
    user: joi
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    date_commande: joi.date().required(),
    prix: joi.number().min(0).required(),
    status: joi.boolean().required(),
  });

  const CommandeUpdate = joi.object({
    user: joi.string().regex(/^[0-9a-fA-F]{24}$/),
    status: joi.boolean(),
    url: joi.string(),
  });

  return {
    CommandeCreate: CommandeCreate.validate(body),
    CommandeUpdate: CommandeUpdate.validate(body),
  };
}
