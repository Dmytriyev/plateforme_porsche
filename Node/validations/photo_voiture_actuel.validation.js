import joi from "joi";
export default function photo_voiture_actuelValidation(body) {
  const photo_voiture_actuelCreate = joi.object({
    name: joi.string().required().max(250),
    alt: joi.string().max(250),
    model_porsche_actuel: joi.string().hex().length(24), // Many-to-One: un seul model_porsche_actuel
    couleur_exterieur: joi.string().hex().length(24), // Many-to-One: couleur extérieure
    couleur_interieur: joi.string().hex().length(24), // Many-to-One: couleur intérieure
  });
  const photo_voiture_actuelUpdate = joi.object({
    name: joi.string(),
    alt: joi.string(),
    model_porsche_actuel: joi.string().hex().length(24), // Many-to-One: un seul model_porsche_actuel
    couleur_exterieur: joi.string().hex().length(24), // Many-to-One: couleur extérieure
    couleur_interieur: joi.string().hex().length(24), // Many-to-One: couleur intérieure
  });
  return {
    photo_voiture_actuelCreate: photo_voiture_actuelCreate.validate(body),
    photo_voiture_actuelUpdate: photo_voiture_actuelUpdate.validate(body),
  };
}
