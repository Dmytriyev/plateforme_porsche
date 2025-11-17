import joi from "joi";

export default function photo_voitureValidation(body) {
  const mongoIdSchema = () => joi.string().hex().length(24);

  const photo_voitureCreate = joi.object({
    name: joi.string().required().max(250),
    alt: joi.string().max(250),
    voiture: joi.array().items(mongoIdSchema().required()), // Many-to-Many: plusieurs voitures
    couleur_exterieur: mongoIdSchema(), // Many-to-One: une seule couleur
    couleur_interieur: mongoIdSchema(), // Many-to-One: une seule couleur
    taille_jante: mongoIdSchema(), // Many-to-One: une seule taille
  });
  const photo_voitureUpdate = joi.object({
    name: joi.string(),
    alt: joi.string(),
    voiture: joi.array().items(mongoIdSchema()), // Many-to-Many: plusieurs voitures
    couleur_exterieur: mongoIdSchema(), // Many-to-One: une seule couleur
    couleur_interieur: mongoIdSchema(), // Many-to-One: une seule couleur
    taille_jante: mongoIdSchema(), // Many-to-One: une seule taille
  });
  return {
    photo_voitureCreate: photo_voitureCreate.validate(body),
    photo_voitureUpdate: photo_voitureUpdate.validate(body),
  };
}
