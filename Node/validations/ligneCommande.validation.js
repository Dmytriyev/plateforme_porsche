import joi from "joi";

export default function ligneCommandeValidation(body) {
  const ligneCommandeCreate = joi.object({
    type_produit_v: joi.string().regex(/^[0-9a-fA-F]{24}$/),
    type_produit_a: joi.string().regex(/^[0-9a-fA-F]{24}$/),
    commande: joi
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    nom_produit: joi.string().required(),
    quantite: joi.number().min(1).required(),
    prix: joi.number().min(0).required(),
  });

  const ligneCommandeUpdate = joi.object({
    quantite: joi.number().min(1),
  });

  return {
    ligneCommandeCreate: ligneCommandeCreate.validate(body),
    ligneCommandeUpdate: ligneCommandeUpdate.validate(body),
  };
}
