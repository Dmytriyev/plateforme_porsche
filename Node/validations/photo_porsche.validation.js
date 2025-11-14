import joi from "joi";
export default function photo_porscheValidation(body) {
  const photo_porscheCreate = joi.object({
    name: joi.string().required().max(250),
    alt: joi.string().max(250),
    model_porsche: joi.string().hex().length(24), // Many-to-One: un seul model_porsche
    couleur_exterieur: joi.string().hex().length(24), // Many-to-One: couleur extérieure
    couleur_interieur: joi.string().hex().length(24), // Many-to-One: couleur intérieure
  });
  const photo_porscheUpdate = joi.object({
    name: joi.string(),
    alt: joi.string(),
    model_porsche: joi.string().hex().length(24), // Many-to-One: un seul model_porsche
    couleur_exterieur: joi.string().hex().length(24), // Many-to-One: couleur extérieure
    couleur_interieur: joi.string().hex().length(24), // Many-to-One: couleur intérieure
  });

  return {
    photo_porscheCreate: photo_porscheCreate.validate(body),
    photo_porscheUpdate: photo_porscheUpdate.validate(body),
  };
}
