import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Button, Input, Alert, Card } from '../components/common';
import { validateEmail } from '../utils/validation.js';
import './Login.css';

/**
 * Page de connexion
 */
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
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
      const result = await login(formData.email, formData.password);

      if (result.success) {
        navigate('/');
      } else {
        setErrorMessage(result.error || 'Erreur de connexion');
      }
    } catch (err) {
      console.error('Erreur connexion:', err);
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <Card padding="lg">
          <div className="login-header">
            <h2 className="login-title">Connexion</h2>
            <p className="login-subtitle">
              Connectez-vous à votre compte Porsche
            </p>
          </div>

          {errorMessage && (
            <div className="login-error">
              <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
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

            <Button
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="login-links">
            <p>
              Pas encore de compte ?{' '}
              <Link to="/register" className="login-link">
                S'inscrire
              </Link>
            </p>
            <Link to="/mot-de-passe-oublie" className="login-forgot">
              Mot de passe oublié ?
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
