import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Alert, Input, Button } from '../components/common';
import { validateRegisterForm, handleFormChange } from '../utils/formHelpers.js';
import '../css/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

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

  const handleChange = handleFormChange(setFormData, setErrors);

  const validateForm = () => {
    const newErrors = validateRegisterForm(formData);
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
        navigate('/', { replace: true });
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
          <h1 className="register-title-porsche">Création de compte</h1>

          {errorMessage && (
            <div className="register-error-porsche">
              <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form-porsche">
            <Input
              label="Prénom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Votre prénom"
              error={errors.prenom}
              autoComplete="given-name"
              required
            />

            <Input
              label="Nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Votre nom"
              error={errors.nom}
              autoComplete="family-name"
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre.email@exemple.com"
              error={errors.email}
              autoComplete="email"
              required
            />

            <Input
              label="Téléphone"
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="06 01 23 45 56"
              error={errors.telephone}
              autoComplete="tel"
            />

            <Input
              label="Mot de passe"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              autoComplete="new-password"
              required
            />

            <Input
              label="Répétez mot de passe"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirmPassword}
              autoComplete="new-password"
              required
            />

            <Input
              label="Adresse postale"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              placeholder="Votre adresse"
              error={errors.adresse}
              autoComplete="street-address"
              required
            />

            <Input
              label="Code postal"
              name="codePostal"
              value={formData.codePostal}
              onChange={handleChange}
              placeholder="75000"
              error={errors.codePostal}
              autoComplete="postal-code"
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
