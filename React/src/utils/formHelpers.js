import {
  validateEmail,
  validatePassword,
  validateTelephone,
  getPasswordErrors,
} from "./validation.js";

export const validateLoginForm = (formData) => {
  const errors = {};
  if (!formData.email) errors.email = "L'email est requis";
  else if (!validateEmail(formData.email)) errors.email = "Email invalide";
  if (!formData.password) errors.password = "Le mot de passe est requis";
  return errors;
};

export const validateRegisterForm = (formData) => {
  const errors = {};
  if (!formData.prenom?.trim()) errors.prenom = "Le prénom est requis";
  if (!formData.nom?.trim()) errors.nom = "Le nom est requis";
  if (!formData.email) errors.email = "L'email est requis";
  else if (!validateEmail(formData.email)) errors.email = "Email invalide";
  if (formData.telephone && !validateTelephone(formData.telephone)) {
    errors.telephone = "Numéro de téléphone invalide";
  }
  if (!formData.password) errors.password = "Le mot de passe est requis";
  else if (!validatePassword(formData.password)) {
    errors.password = getPasswordErrors(formData.password)[0];
  }
  if (!formData.confirmPassword)
    errors.confirmPassword = "La confirmation du mot de passe est requise";
  else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas";
  }
  if (!formData.adresse?.trim())
    errors.adresse = "L'adresse postale est requise";
  if (!formData.codePostal?.trim())
    errors.codePostal = "Le code postal est requis";
  else if (!/^\d{5}$/.test(formData.codePostal)) {
    errors.codePostal = "Le code postal doit contenir 5 chiffres";
  }
  return errors;
};

export const validateContactForm = (formData) => {
  const errors = {};
  if (!formData.prenom?.trim()) errors.prenom = "Le prénom est requis";
  if (!formData.nom?.trim()) errors.nom = "Le nom est requis";
  if (!formData.email) errors.email = "L'email est requis";
  else if (!validateEmail(formData.email)) errors.email = "Email invalide";
  if (!formData.telephone) errors.telephone = "Le téléphone est requis";
  else if (!validateTelephone(formData.telephone)) {
    errors.telephone = "Numéro de téléphone invalide";
  }
  return errors;
};

export const handleFormChange = (setFormData, setErrors) => (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
  if (setErrors) setErrors((prev) => ({ ...prev, [name]: "" }));
};
