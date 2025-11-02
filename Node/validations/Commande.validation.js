import joi from "joi";

export default function CommandeValidation(body) {
  const CommandeCreate = joi.object({
    date_commande: joi.date(),
    prix: joi.number(),
    acompte: joi.number(),
    status: joi.boolean(),
    factureUrl: joi.string(),
    user: joi.string().hex().length(24), // Accepter le champ user (sera auto-assigné dans le contrôleur)
  });

  const CommandeUpdate = joi.object({
    date_commande: joi.date(),
    prix: joi.number(),
    acompte: joi.number(),
    status: joi.boolean(),
    factureUrl: joi.string(),
    // user ne peut pas être modifié
  });

  return {
    CommandeCreate: CommandeCreate.validate(body),
    CommandeUpdate: CommandeUpdate.validate(body),
  };
}
