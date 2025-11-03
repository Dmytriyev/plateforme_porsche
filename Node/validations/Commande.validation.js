import joi from "joi";

export default function CommandeValidation(body) {
  const CommandeCreate = joi.object({
    date_commande: joi.date(),
    prix: joi.number().min(0),
    acompte: joi.number().min(0),
    status: joi.boolean(),
    factureUrl: joi.string(),
    user: joi.string().hex().length(24),
  });

  const CommandeUpdate = joi.object({
    date_commande: joi.date(),
    prix: joi.number().min(0),
    acompte: joi.number().min(0),
    status: joi.boolean(),
    factureUrl: joi.string(),
  });

  return {
    CommandeCreate: CommandeCreate.validate(body),
    CommandeUpdate: CommandeUpdate.validate(body),
  };
}
