import joi from "joi";

export default function ligneCommandeValidation(body) {
  const ligneCommandeCreate = joi.object({
    type_produit: joi.boolean().required().messages({
      "any.required":
        "Le type de produit est requis (true=voiture, false=accessoire)",
    }),
    quantite: joi.number().min(1).required().messages({
      "number.min": "La quantité doit être au moins 1",
      "any.required": "La quantité est requise",
    }),
    prix: joi.number().min(0).messages({
      "number.min": "Le prix ne peut pas être négatif",
    }),
    acompte: joi
      .number()
      .min(0)
      .when("type_produit", {
        is: true,
        then: joi.number().min(0).max(joi.ref("prix")).messages({
          "number.max": "L'acompte ne peut pas dépasser le prix",
        }),
      })
      .messages({
        "number.min": "L'acompte ne peut pas être négatif",
      }),
    voiture: joi
      .string()
      .hex()
      .length(24)
      .when("type_produit", {
        is: true,
        then: joi.required(),
      })
      .messages({
        "any.required": "Une voiture est requise quand type_produit est true",
        "string.length": "ID de voiture invalide",
      }),
    accesoire: joi
      .string()
      .hex()
      .length(24)
      .when("type_produit", {
        is: false,
        then: joi.required(),
      })
      .messages({
        "any.required": "Un accessoire est requis quand type_produit est false",
        "string.length": "ID d'accessoire invalide",
      }),
    commande: joi.string().hex().length(24).required().messages({
      "any.required": "La commande est requise",
      "string.length": "ID de commande invalide",
    }),
  });

  const ligneCommandeUpdate = joi.object({
    quantite: joi.number().min(1).messages({
      "number.min": "La quantité doit être au moins 1",
    }),
    prix: joi.number().min(0).messages({
      "number.min": "Le prix ne peut pas être négatif",
    }),
    acompte: joi.number().min(0).messages({
      "number.min": "L'acompte ne peut pas être négatif",
    }),
    // type_produit, voiture, accesoire, commande ne peuvent pas être modifiés
  });

  const ligneCommandeQuantite = joi.object({
    quantite: joi.number().min(1).required().messages({
      "number.min": "La quantité doit être au moins 1",
      "any.required": "La quantité est requise",
    }),
  });

  return {
    ligneCommandeCreate: ligneCommandeCreate.validate(body),
    ligneCommandeUpdate: ligneCommandeUpdate.validate(body),
    ligneCommandeQuantite: ligneCommandeQuantite.validate(body),
  };
}
