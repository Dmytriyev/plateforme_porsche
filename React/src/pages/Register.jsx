import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Button, Input, Alert, Card } from '../components/common';
import { validateEmail, validatePassword, validateTelephone, getPasswordErrors } from '../utils/validation.js';
import './Register.css';

/**
 * Page d'inscription
 */
const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    adresse: '',
    ville: '',
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

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (!validatePassword(formData.password)) {
      const passwordErrors = getPasswordErrors(formData.password);
      newErrors.password = passwordErrors[0];
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (formData.telephone && !validateTelephone(formData.telephone)) {
      newErrors.telephone = 'Numéro de téléphone invalide';
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
        telephone: formData.telephone,
        adresse: formData.adresse,
        ville: formData.ville,
        code_postal: formData.codePostal,
      };

      const result = await register(userData);

      if (result.success) {
        navigate('/');
      } else {
        setErrorMessage(result.error || 'Erreur d\'inscription');
      }
    } catch (error) {
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-wrapper">
        <Card padding="lg">
          <div className="register-header">
            <h2 className="register-title">Inscription</h2>
            <p className="register-subtitle">
              Créez votre compte Porsche
            </p>
          </div>

          {errorMessage && (
            <div className="register-error">
              <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            {/* Nom et Prénom */}
            <div className="register-form-row">
              <Input
                label="Nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                error={errors.nom}
                required
              />
              <Input
                label="Prénom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                error={errors.prenom}
                required
              />
            </div>

            {/* Email */}
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              error={errors.email}
              required
            />

            {/* Mot de passe */}
            <Input
              label="Mot de passe"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              required
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirmPassword}
              required
            />

            {/* Téléphone */}
            <Input
              label="Téléphone"
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="06 12 34 56 78"
              error={errors.telephone}
            />

            {/* Adresse */}
            <Input
              label="Adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              error={errors.adresse}
            />

            {/* Ville et Code postal */}
            <div className="register-form-row">
              <Input
                label="Ville"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                error={errors.ville}
              />
              <Input
                label="Code postal"
                name="codePostal"
                value={formData.codePostal}
                onChange={handleChange}
                placeholder="75000"
                error={errors.codePostal}
              />
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </Button>
          </form>

          <div className="register-links">
            <p>
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="register-link">
                Se connecter
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
