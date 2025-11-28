// Page de connexion utilisateur avec gestion des erreurs et redirections.
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { validateLoginForm, handleFormChange } from "../utils/helpers.js";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Login.css";

const Login = () => {
  // Hook de navigation pour rediriger après connexion réussie
  const navigate = useNavigate();
  // Récupération de la fonction de connexion depuis le contexte d'authentification
  const { login } = useContext(AuthContext);
  // États pour les données du formulaire, les erreurs, le chargement et les messages d'erreur
  const [formData, setFormData] = useState({ email: "", password: "" });
  // État pour les erreurs de validation du formulaire
  const [errors, setErrors] = useState({});
  // État pour indiquer le chargement lors de la soumission du formulaire 
  const [loading, setLoading] = useState(false);
  // État pour le message d'erreur global de connexion 
  const [errorMessage, setErrorMessage] = useState("");
  // Gestionnaire de changement pour les champs du formulaire
  const handleChange = handleFormChange(setFormData, setErrors);

  // Fonction de validation du formulaire avant soumission
  const validateForm = () => {
    // Valide les données du formulaire et met à jour les erreurs
    const newErrors = validateLoginForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestionnaire de soumission du formulaire asynchrone
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validation du formulaire avant de procéder à la connexion
    if (!validateForm()) {
      return;
    }
    // Indication de l'état de chargement lors de la soumission du formulaire
    setLoading(true);
    // Tentative de connexion avec les données du formulaire
    try {
      // Appel de la fonction de connexion du contexte d'authentification
      const result = await login(formData.email, formData.password);
      // Redirection vers la page d'accueil en cas de succès de la connexion
      if (result.success) {
        navigate("/", { replace: true });
        // sinon, affichage du message d'erreur retourné
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
          {/* Affichage du message d'erreur global de connexion */}
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
          {/* Formulaire de connexion */}
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
              className="btn-black"
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
