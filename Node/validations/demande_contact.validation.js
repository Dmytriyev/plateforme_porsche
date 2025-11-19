import joi from "joi";

const mongoIdSchema = () => joi.string().hex().length(24);

const demandeContactCreate = joi.object({
  prenom: joi.string().required().max(100).min(2),
  nom: joi.string().required().max(100).min(2),
  email: joi.string().email().required().max(150).min(5),
  telephone: joi.string().required().max(20).min(10),
  message: joi.string().max(2000),
  vehicule_id: mongoIdSchema(),
  type_vehicule: joi.string().valid('occasion', 'neuf', 'autre'),
  user_id: mongoIdSchema(),
});

export default function demandeContactValidation(body) {
  return {
    demandeContactCreate: demandeContactCreate.validate(body),
  };
}

