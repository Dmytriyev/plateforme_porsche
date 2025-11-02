import joi from "joi";

export default function ligneCommandeValidation(body) {
  const ligneCommandeCreate = joi.object({
    type_produit: joi.boolean().required(),
    quantite: joi.number().min(1).required(),
    prix: joi.number().min(0),
    acompte: joi.number().min(0),
    voiture: joi.string().hex().length(24), // Many-to-One: une seule voiture
    accesoire: joi.string().hex().length(24), // Many-to-One: un seul accesoire
    commande: joi.string().hex().length(24).required(), // Many-to-One: une seule commande
  });

  const ligneCommandeUpdate = joi.object({
    type_produit: joi.boolean(),
    quantite: joi.number().min(1),
    prix: joi.number().min(0),
    acompte: joi.number().min(0),
  });

  return {
    ligneCommandeCreate: ligneCommandeCreate.validate(body),
    ligneCommandeUpdate: ligneCommandeUpdate.validate(body),
  };
}
