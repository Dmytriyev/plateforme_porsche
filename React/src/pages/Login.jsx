import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Alert } from '../components/common';
import { validateEmail } from '../utils/validation.js';
import './Login.css';


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
        // Utiliser replace pour éviter les problèmes de cache du navigateur
        // et un petit délai pour s'assurer que le contexte est mis à jour
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } else {
        setErrorMessage(result.error || 'Erreur de connexion');
        setLoading(false);
      }
    } catch (err) {
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container-porsche">
      <div className="login-form-wrapper-porsche">
        <div className="login-form-card-porsche">
          {/* Titre */}
          <h1 className="login-title-porsche">Connexion</h1>

          {/* Message d'erreur */}
          {errorMessage && (
            <div className="login-error-porsche">
              <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="login-form-porsche">
            {/* Champ Email */}
            <div className="login-field-porsche">
              <label htmlFor="email" className="login-label-porsche">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@gmail.com"
                className={`login-input-porsche ${errors.email ? 'error' : ''}`}
                autoComplete="email"
                required
              />
              {errors.email && (
                <span className="login-field-error-porsche">{errors.email}</span>
              )}
            </div>

            {/* Champ Password */}
            <div className="login-field-porsche">
              <label htmlFor="password" className="login-label-porsche">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mot de passe"
                className={`login-input-porsche ${errors.password ? 'error' : ''}`}
                autoComplete="current-password"
                required
              />
              {errors.password && (
                <span className="login-field-error-porsche">{errors.password}</span>
              )}
            </div>

            {/* Bouton Se connecter */}
            <button
              type="submit"
              className="login-btn-primary-porsche"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            {/* Séparateur */}
            <div className="login-separator-porsche">
              <span className="login-separator-text-porsche">Ou</span>
            </div>

            {/* Bouton Créer un compte */}
            <Link
              to="/register"
              className="login-btn-secondary-porsche"
            >
              Créer un compte
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
