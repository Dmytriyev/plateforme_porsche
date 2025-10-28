import joi from "joi";

export default function CommandeValidation(body) {
  const CommandeCreate = joi.object({
    date_commande: joi.date().required(),
    prix: joi.number().min(0),
    acompte: joi.number().min(0),
    status: joi.boolean().required(),
    factureUrl: joi.string(),
    user: joi.string().hex().length(24),
  });

  const CommandeUpdate = joi.object({
    status: joi.boolean(),
    factureUrl: joi.string(),
    user: joi.string().hex().length(24),
  });

  return {
    CommandeCreate: CommandeCreate.validate(body),
    CommandeUpdate: CommandeUpdate.validate(body),
  };
}
