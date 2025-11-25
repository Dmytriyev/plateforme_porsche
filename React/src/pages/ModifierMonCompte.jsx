/**
 * ModifierMonCompte.jsx — Page de modification du compte
 *
 * - Formulaire de profil et sécurité.
 */

import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import userService from "../services/user.service.js";
import Loading from "../components/common/Loading.jsx";
import "../css/ModifierMonCompte.css";

// Page : modifier les informations du compte utilisateur et le mot de passe. Requiert connexion.
const ModifierMonCompte = () => {
  const navigate = useNavigate();
  const { updateUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    code_postal: "",
    ville: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await userService.getCurrentUser();

        setFormData({
          nom: userData.nom || "",
          prenom: userData.prenom || "",
          email: userData.email || "",
          telephone: userData.telephone || "",
          adresse: userData.adresse || "",
          code_postal: userData.code_postal || "",
          ville: userData.ville || "",
        });
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.nom || !formData.prenom) {
      setError("Le nom et le prénom sont obligatoires");
      return false;
    }

    if (!formData.email) {
      setError("L'email est obligatoire");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email invalide");
      return false;
    }

    if (showPasswordSection) {
      if (!passwordData.currentPassword) {
        setError("Le mot de passe actuel est requis");
        return false;
      }

      if (!passwordData.newPassword) {
        setError("Le nouveau mot de passe est requis");
        return false;
      }

      if (passwordData.newPassword.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères");
        return false;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const dataToUpdate = { ...formData };

      // Ajouter les données de mot de passe si la section est ouverte
      if (
        showPasswordSection &&
        passwordData.currentPassword &&
        passwordData.newPassword
      ) {
        dataToUpdate.currentPassword = passwordData.currentPassword;
        dataToUpdate.newPassword = passwordData.newPassword;
      }

      const updatedUser = await userService.updateProfile(dataToUpdate);

      // Mettre à jour le contexte
      if (updateUser) {
        updateUser(updatedUser);
      }

      setSuccess("Vos informations ont été mises à jour avec succès");

      // Réinitialiser les champs de mot de passe
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordSection(false);

      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate("/mon-compte");
      }, 2000);
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Chargement..." />;
  }

  return (
    <div className="modifier-compte-container">
      <div className="modifier-compte-content">
        <div className="modifier-compte-header">
          <button
            className="modifier-compte-back"
            onClick={() => navigate("/mon-compte")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <h1 className="modifier-compte-title">Modifier mes informations</h1>
          <p className="modifier-compte-subtitle">
            Mettez à jour vos informations personnelles
          </p>
        </div>

        {error && (
          <div className="modifier-compte-message modifier-compte-message-error">
            {error}
          </div>
        )}

        {success && (
          <div className="modifier-compte-message modifier-compte-message-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modifier-compte-form">
          {/* Informations personnelles */}
          <section className="modifier-compte-section">
            <h2 className="modifier-compte-section-title">
              Informations personnelles
            </h2>

            <div className="modifier-compte-row">
              <div className="modifier-compte-field">
                <label htmlFor="nom">Nom *</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  placeholder="Votre nom"
                />
              </div>

              <div className="modifier-compte-field">
                <label htmlFor="prenom">Prénom *</label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  placeholder="Votre prénom"
                />
              </div>
            </div>

            <div className="modifier-compte-field">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="votre.email@exemple.com"
              />
            </div>

            <div className="modifier-compte-field">
              <label htmlFor="telephone">Téléphone</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="01 23 45 67 89"
              />
            </div>
          </section>

          {/* Adresse */}
          <section className="modifier-compte-section">
            <h2 className="modifier-compte-section-title">Adresse</h2>

            <div className="modifier-compte-field">
              <label htmlFor="adresse">Adresse</label>
              <input
                type="text"
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                placeholder="Numéro et rue"
              />
            </div>

            <div className="modifier-compte-row">
              <div className="modifier-compte-field">
                <label htmlFor="code_postal">Code postal</label>
                <input
                  type="text"
                  id="code_postal"
                  name="code_postal"
                  value={formData.code_postal}
                  onChange={handleChange}
                  placeholder="75001"
                />
              </div>

              <div className="modifier-compte-field">
                <label htmlFor="ville">Ville</label>
                <input
                  type="text"
                  id="ville"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  placeholder="Paris"
                />
              </div>
            </div>
          </section>

          {/* Mot de passe */}
          <section className="modifier-compte-section">
            <div className="modifier-compte-section-header">
              <h2 className="modifier-compte-section-title">Mot de passe</h2>
              <button
                type="button"
                className="modifier-compte-toggle-password"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
              >
                {showPasswordSection ? "Annuler" : "Modifier le mot de passe"}
              </button>
            </div>

            {showPasswordSection && (
              <div className="modifier-compte-password-fields">
                <div className="modifier-compte-field">
                  <label htmlFor="currentPassword">Mot de passe actuel *</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Votre mot de passe actuel"
                    autoComplete="current-password"
                  />
                </div>

                <div className="modifier-compte-field">
                  <label htmlFor="newPassword">Nouveau mot de passe *</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Minimum 6 caractères"
                    autoComplete="new-password"
                  />
                </div>

                <div className="modifier-compte-field">
                  <label htmlFor="confirmPassword">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Répétez le nouveau mot de passe"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Actions */}
          <div className="modifier-compte-actions">
            <button
              type="button"
              onClick={() => navigate("/mon-compte")}
              className="modifier-compte-btn-cancel"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="modifier-compte-btn-save"
            >
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifierMonCompte;
