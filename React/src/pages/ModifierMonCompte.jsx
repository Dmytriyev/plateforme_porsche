// page de modification du compte utilisateur
import Loading from "../components/common/Loading.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import "../css/ModifierMonCompte.css";
import userService from "../services/user.service.js";
import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// Constantes de validation et délais 
const MIN_PASSWORD_LENGTH = 6;
const REDIRECT_DELAY_MS = 2000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0[1-9]([-. ]?\d{2}){4}$/;
const POSTAL_CODE_REGEX = /^\d{5}$/;

const ModifierMonCompte = () => {
  const navigate = useNavigate();
  const { updateUser } = useContext(AuthContext);
  // États locaux pour les données du formulaire, le chargement, les messages
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    code_postal: "",
    ville: "",
  });
  // États pour les champs de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  // États pour le chargement, l'enregistrement, les messages d'erreur et de succès
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  // Charger les données utilisateur au montage du composant
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Récupérer les données utilisateur depuis le service
        const userData = await userService.getCurrentUser();
        // Initialiser le formulaire avec les données récupérées
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

  // Handlers generique pour les changements de champs
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  }, []);

  // Handler spécifique pour les champs de mot de passe
  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setError("");
  }, []);

  // Validation du formulaire avant soumission
  const validateForm = useCallback(() => {
    // Validation des champs obligatoires
    const nomTrimmed = formData.nom?.trim();
    const prenomTrimmed = formData.prenom?.trim();
    // si nom ou prenom vide error
    if (!nomTrimmed || !prenomTrimmed) {
      setError("Le nom et le prénom sont obligatoires");
      return false;
    }

    // Validation de l'email
    const emailTrimmed = formData.email?.trim();
    // si email vide error
    if (!emailTrimmed) {
      setError("L'email est obligatoire");
      return false;
    }
    // si format email invalide error
    if (!EMAIL_REGEX.test(emailTrimmed)) {
      setError("Format d'email invalide (exemple : nom@domaine.com)");
      return false;
    }
    // si telephone renseigné, validation du format
    if (formData.telephone?.trim() && !PHONE_REGEX.test(formData.telephone.replace(/\s/g, ""))) {
      setError("Format de téléphone invalide (exemple : 01 23 45 67 89)");
      return false;
    }
    // si code postal renseigné, validation du format
    if (formData.code_postal?.trim() && !POSTAL_CODE_REGEX.test(formData.code_postal.trim())) {
      setError("Le code postal doit contenir 5 chiffres");
      return false;
    }
    // si la section mot de passe est affichée, valider les champs de mot de passe
    if (showPasswordSection) {
      if (!passwordData.currentPassword) {
        setError("Le mot de passe actuel est requis");
        return false;
      }
      // si nouveau mot de passe vide error
      if (!passwordData.newPassword) {
        setError("Le nouveau mot de passe est requis");
        return false;
      }
      // si nouveau mot de passe trop court error
      if (passwordData.newPassword.length < MIN_PASSWORD_LENGTH) {
        setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`);
        return false;
      }
      // si confirmation mot de passe ne correspond pas error
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        return false;
      }
    }

    return true;
  }, [formData, passwordData, showPasswordSection]);

  // Soumission du formulaire
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      // si validation échoue, arrêter la soumission
      if (!validateForm()) {
        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        // Nettoyer les données (trim) pour éviter les espaces superflus
        const cleanedData = Object.fromEntries(
          // trim de chaque valeur de formData
          Object.entries(formData).map(([key, value]) => [
            key,
            typeof value === "string" ? value.trim() : value,
          ])
        );
        // Préparer les données à envoyer au backend
        const dataToUpdate = { ...cleanedData };
        // si modification du mot de passe, ajouter les champs nécessaires
        if (
          showPasswordSection &&
          passwordData.currentPassword &&
          passwordData.newPassword
        ) {
          dataToUpdate.currentPassword = passwordData.currentPassword;
          dataToUpdate.newPassword = passwordData.newPassword;
        }
        // Appeler le service pour mettre à jour le profil utilisateur
        const updatedUser = await userService.updateProfile(dataToUpdate);
        // Mettre à jour le contexte Auth si la fonction est disponible
        if (typeof updateUser === "function") {
          updateUser(updatedUser);
        }
        // Afficher le message de succès
        setSuccess("Vos informations ont été mises à jour avec succès");

        // Réinitialiser les champs de mot de passe par sécurité
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordSection(false);

        // Rediriger vers la page Mon Compte après un délai
        setTimeout(() => {
          navigate("/mon-compte");
        }, REDIRECT_DELAY_MS);
      } catch (err) {
        // Gérer les erreurs du backend
        setError(err.message || "Erreur lors de la mise à jour du profil");
      } finally {
        setSaving(false);
      }
    },
    [formData, passwordData, showPasswordSection, validateForm, navigate, updateUser]
  );
  // si en chargement, afficher le composant Loading
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
        {/* success message */}
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
