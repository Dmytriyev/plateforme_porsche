import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Alert } from '../components/common';
import { validateEmail, validatePassword, validateTelephone, getPasswordErrors } from '../utils/validation.js';
import './Register.css';

/**
 * Page d'inscription
 */
const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    adresse: '',
    codePostal: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (formData.telephone && !validateTelephone(formData.telephone)) {
      newErrors.telephone = 'Numéro de téléphone invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (!validatePassword(formData.password)) {
      const passwordErrors = getPasswordErrors(formData.password);
      newErrors.password = passwordErrors[0];
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.adresse.trim()) newErrors.adresse = 'L\'adresse postale est requise';
    if (!formData.codePostal.trim()) {
      newErrors.codePostal = 'Le code postal est requis';
    } else if (!/^[0-9]{5}$/.test(formData.codePostal)) {
      newErrors.codePostal = 'Le code postal doit contenir 5 chiffres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        telephone: formData.telephone || '0000000000',
        adresse: formData.adresse,
        code_postal: formData.codePostal,
      };

      const result = await register(userData);

      if (result.success) {
        // Utiliser replace pour éviter les problèmes de cache du navigateur
        // et un petit délai pour s'assurer que le contexte est mis à jour
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } else {
        setErrorMessage(result.error || 'Erreur d\'inscription');
        setLoading(false);
      }
    } catch (err) {
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <div className="register-container-porsche">
      <div className="register-form-wrapper-porsche">
        <div className="register-form-card-porsche">
          {/* Titre */}
          <h1 className="register-title-porsche">Création de compte</h1>

          {/* Message d'erreur */}
          {errorMessage && (
            <div className="register-error-porsche">
              <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="register-form-porsche">
            {/* Prénom */}
            <div className="register-field-porsche">
              <label htmlFor="prenom" className="register-label-porsche">
                Prénom <span className="register-required-porsche">*</span>
              </label>
              <input
                id="prenom"
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Votre prénom"
                className={`register-input-porsche ${errors.prenom ? 'error' : ''}`}
                autoComplete="given-name"
                required
              />
              {errors.prenom && (
                <span className="register-field-error-porsche">{errors.prenom}</span>
              )}
            </div>

            {/* Nom */}
            <div className="register-field-porsche">
              <label htmlFor="nom" className="register-label-porsche">
                Nom <span className="register-required-porsche">*</span>
              </label>
              <input
                id="nom"
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Votre nom"
                className={`register-input-porsche ${errors.nom ? 'error' : ''}`}
                autoComplete="family-name"
                required
              />
              {errors.nom && (
                <span className="register-field-error-porsche">{errors.nom}</span>
              )}
            </div>

            {/* Email */}
            <div className="register-field-porsche">
              <label htmlFor="email" className="register-label-porsche">
                Email <span className="register-required-porsche">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre.email@exemple.com"
                className={`register-input-porsche ${errors.email ? 'error' : ''}`}
                autoComplete="email"
                required
              />
              {errors.email && (
                <span className="register-field-error-porsche">{errors.email}</span>
              )}
            </div>

            {/* Téléphone */}
            <div className="register-field-porsche">
              <label htmlFor="telephone" className="register-label-porsche">
                Téléphone
              </label>
              <input
                id="telephone"
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="06 01 23 45 56"
                className={`register-input-porsche ${errors.telephone ? 'error' : ''}`}
                autoComplete="tel"
              />
              {errors.telephone && (
                <span className="register-field-error-porsche">{errors.telephone}</span>
              )}
            </div>

            {/* Mot de passe */}
            <div className="register-field-porsche">
              <label htmlFor="password" className="register-label-porsche">
                Mot de passe <span className="register-required-porsche">*</span>
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`register-input-porsche ${errors.password ? 'error' : ''}`}
                autoComplete="new-password"
                required
              />
              {errors.password && (
                <span className="register-field-error-porsche">{errors.password}</span>
              )}
            </div>

            {/* Répétez mot de passe */}
            <div className="register-field-porsche">
              <label htmlFor="confirmPassword" className="register-label-porsche">
                Répétez mot de passe <span className="register-required-porsche">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`register-input-porsche ${errors.confirmPassword ? 'error' : ''}`}
                autoComplete="new-password"
                required
              />
              {errors.confirmPassword && (
                <span className="register-field-error-porsche">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Adresse postale */}
            <div className="register-field-porsche">
              <label htmlFor="adresse" className="register-label-porsche">
                Adresse postale <span className="register-required-porsche">*</span>
              </label>
              <input
                id="adresse"
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                placeholder="Votre adresse"
                className={`register-input-porsche ${errors.adresse ? 'error' : ''}`}
                autoComplete="street-address"
                required
              />
              {errors.adresse && (
                <span className="register-field-error-porsche">{errors.adresse}</span>
              )}
            </div>

            {/* Code postal */}
            <div className="register-field-porsche">
              <label htmlFor="codePostal" className="register-label-porsche">
                Code postale <span className="register-required-porsche">*</span>
              </label>
              <input
                id="codePostal"
                type="text"
                name="codePostal"
                value={formData.codePostal}
                onChange={handleChange}
                placeholder="75000"
                className={`register-input-porsche ${errors.codePostal ? 'error' : ''}`}
                autoComplete="postal-code"
                required
              />
              {errors.codePostal && (
                <span className="register-field-error-porsche">{errors.codePostal}</span>
              )}
            </div>

            {/* Bouton Créer mon compte */}
            <button
              type="submit"
              className="register-btn-primary-porsche"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
