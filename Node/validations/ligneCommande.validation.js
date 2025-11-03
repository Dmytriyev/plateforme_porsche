import joi from "joi";

export default function ligneCommandeValidation(body) {
  const ligneCommandeCreate = joi.object({
    type_produit: joi.boolean().required(),
    quantite: joi.number().integer().min(1).required(),
    prix: joi.number().min(0),
    acompte: joi.number().min(0).max(joi.ref("prix")),
    voiture: joi.string().hex().length(24).when("type_produit", {
      is: true,
      then: joi.required(),
    }),
    accesoire: joi.string().hex().length(24).when("type_produit", {
      is: false,
      then: joi.required(),
    }),
    commande: joi.string().hex().length(24).required(),
  });

  const ligneCommandeUpdate = joi.object({
    quantite: joi.number().integer().min(1),
    prix: joi.number().min(0),
    acompte: joi.number().min(0),
  });

  const ligneCommandeQuantite = joi.object({
    quantite: joi.number().integer().min(1).required(),
  });

  return {
    ligneCommandeCreate: ligneCommandeCreate.validate(body),
    ligneCommandeUpdate: ligneCommandeUpdate.validate(body),
    ligneCommandeQuantite: ligneCommandeQuantite.validate(body),
  };
}
