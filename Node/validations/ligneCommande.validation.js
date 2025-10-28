import joi from "joi";

export default function ligneCommandeValidation(body) {
  const ligneCommandeCreate = joi.object({
    quantite: joi.number().min(1).required(),
    prix: joi.number().min(0).required(),
    acompte: joi.number().min(0).required(),
    commande: joi.string().hex().length(24).required(),
    voiture: joi.string().hex().length(24),
    accesoire: joi.string().hex().length(24),
  });

  const ligneCommandeUpdate = joi.object({
    quantite: joi.number().min(1),
    prix: joi.number().min(0),
    acompte: joi.number().min(0),
  });

  return {
    ligneCommandeCreate: ligneCommandeCreate.validate(body),
    ligneCommandeUpdate: ligneCommandeUpdate.validate(body),
  };
}
