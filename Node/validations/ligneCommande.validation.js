/*
  - `model_porsche_id` requis si `type_produit` = true (voiture)
  - `accesoire` requis si `type_produit` = false
  - `voiture` sera rempli par le serveur 
*/
import joi from "joi";

export default function ligneCommandeValidation(body) {
  const ligneCommandeCreate = joi.object({
    type_produit: joi.boolean().required(),
    quantite: joi.number().integer().min(1).required().max(1000),
    prix: joi.number().min(0).max(100000000),
    acompte: joi.number().min(0),
    // voiture ne pas fourni par l'utilisateur
    voiture: joi.forbidden(),
    // Many-to-One: Configuration Porsche pour voitures neuves
    model_porsche_id: joi
      .string()
      .hex()
      .length(24)
      .when("type_produit", { is: true, then: joi.required() }),
    // Many-to-One: pour accesoires
    accesoire: joi
      .string()
      .hex()
      .length(24)
      .when("type_produit", { is: false, then: joi.required() }),
    commande: joi.string().hex().length(24).required(),
  });

  const ligneCommandeUpdate = joi.object({
    quantite: joi.number().integer().min(1),
    prix: joi.number().min(0),
    acompte: joi.number().min(0),
  });

  const ligneCommandeQuantite = joi.object({
    quantite: joi.number().integer().min(1).required().max(1000),
  });

  return {
    ligneCommandeCreate: ligneCommandeCreate.validate(body),
    ligneCommandeUpdate: ligneCommandeUpdate.validate(body),
    ligneCommandeQuantite: ligneCommandeQuantite.validate(body),
  };
}
