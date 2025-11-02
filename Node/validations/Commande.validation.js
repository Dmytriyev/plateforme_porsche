import joi from "joi";

export default function CommandeValidation(body) {
  const CommandeCreate = joi.object({
    date_commande: joi.date().required(),
    prix: joi.number(),
    acompte: joi.number(),
    status: joi.boolean().required(),
    factureUrl: joi.string(),
    user: joi.string().hex().length(24), // Many-to-One: un seul user
  });

  const CommandeUpdate = joi.object({
    status: joi.boolean(),
    factureUrl: joi.string(),
    user: joi.string().hex().length(24), // Many-to-One: un seul user
  });

  return {
    CommandeCreate: CommandeCreate.validate(body),
    CommandeUpdate: CommandeUpdate.validate(body),
  };
}
