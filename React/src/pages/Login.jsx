/**
 * Login.jsx — Page de connexion
 *
 * - Authentification et gestion des erreurs.
 */

import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import "../css/Login.css";
import { validateLoginForm, handleFormChange } from "../utils/helpers.js";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

// Page : formulaire de connexion utilisateur; gère validation et redirections.
const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = handleFormChange(setFormData, setErrors);

  const validateForm = () => {
    const newErrors = validateLoginForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        navigate("/", { replace: true });
      } else {
        setErrorMessage(result.error || "Erreur de connexion");
        setLoading(false);
      }
    } catch (err) {
      setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container-porsche">
      <div className="login-form-wrapper-porsche">
        <div className="login-form-card-porsche">
          <h1 className="login-title-porsche">Connexion</h1>

          {errorMessage && (
            <div className="login-error-message">
              <p>{errorMessage}</p>
              <button
                onClick={() => setErrorMessage("")}
                className="error-close"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form-porsche">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@gmail.com"
              error={errors.email}
              autoComplete="email"
              required
            />

            <Input
              label="Mot de passe"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mot de passe"
              error={errors.password}
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            <div className="login-separator-porsche">
              <span className="login-separator-text-porsche">Ou</span>
            </div>

            <Link to="/register" className="login-btn-secondary-porsche">
              Créer un compte
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
