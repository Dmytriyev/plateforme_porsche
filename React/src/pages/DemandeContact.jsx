import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import apiClient from '../config/api.js';
import { extractData } from '../services/httpHelper';
import { Alert } from '../components/common';
import { validateContactForm, handleFormChange } from '../utils/formHelpers.js';
import '../css/DemandeContact.css';

const DemandeContact = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const searchParams = new URLSearchParams(location.search);
  const vehiculeId = searchParams.get('vehicule') || location.state?.vehiculeId;
  const typeVehicule = searchParams.get('type') || location.state?.typeVehicule || 'occasion';

  const [formData, setFormData] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = handleFormChange(setFormData, setErrors);

  const validateForm = () => {
    const newErrors = validateContactForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const contactData = {
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        telephone: formData.telephone,
        message: formData.message || undefined,
        vehicule_id: vehiculeId || undefined,
        type_vehicule: typeVehicule,
        user_id: user?._id || undefined,
      };

      const response = await apiClient.post('/contact/demande', contactData);
      const result = extractData(response);

      if (result) {
        setSuccessMessage('Votre demande a été envoyée avec succès. Nous vous contacterons bientôt.');
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else {
        setErrorMessage('Erreur lors de l\'envoi de la demande');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
        err.message ||
        'Une erreur est survenue. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="demande-contact-container">
      <div className="demande-contact-content">
        <button
          className="demande-contact-back"
          onClick={() => navigate(-1)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour
        </button>

        <h1 className="demande-contact-title">Demande d'information</h1>

        {errorMessage && (
          <div className="demande-contact-error">
            <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
          </div>
        )}

        {successMessage && (
          <div className="demande-contact-success">
            <Alert type="success" message={successMessage} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="demande-contact-form">
          <div className="demande-contact-row">
            <div className="demande-contact-field">
              <label htmlFor="prenom" className="demande-contact-label">
                Prénom <span className="demande-contact-required">*</span>
              </label>
              <input
                id="prenom"
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Votre prénom"
                className={`demande-contact-input ${errors.prenom ? 'error' : ''}`}
                autoComplete="given-name"
                required
              />
              {errors.prenom && (
                <span className="demande-contact-field-error">{errors.prenom}</span>
              )}
            </div>

            <div className="demande-contact-field">
              <label htmlFor="nom" className="demande-contact-label">
                Nom <span className="demande-contact-required">*</span>
              </label>
              <input
                id="nom"
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Votre nom"
                className={`demande-contact-input ${errors.nom ? 'error' : ''}`}
                autoComplete="family-name"
                required
              />
              {errors.nom && (
                <span className="demande-contact-field-error">{errors.nom}</span>
              )}
            </div>
          </div>

          <div className="demande-contact-field">
            <label htmlFor="email" className="demande-contact-label">
              Email <span className="demande-contact-required">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre.email@exemple.com"
              className={`demande-contact-input ${errors.email ? 'error' : ''}`}
              autoComplete="email"
              required
            />
            {errors.email && (
              <span className="demande-contact-field-error">{errors.email}</span>
            )}
          </div>

          <div className="demande-contact-field">
            <label htmlFor="telephone" className="demande-contact-label">
              Téléphone <span className="demande-contact-required">*</span>
            </label>
            <input
              id="telephone"
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="+33 6 12 34 56 78"
              className={`demande-contact-input ${errors.telephone ? 'error' : ''}`}
              autoComplete="tel"
              required
            />
            {errors.telephone && (
              <span className="demande-contact-field-error">{errors.telephone}</span>
            )}
          </div>

          <div className="demande-contact-field">
            <label htmlFor="message" className="demande-contact-label">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Posez-nous vos questions sur ce véhicule..."
              className={`demande-contact-input demande-contact-textarea ${errors.message ? 'error' : ''}`}
              rows="6"
            />
            {errors.message && (
              <span className="demande-contact-field-error">{errors.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="demande-contact-submit"
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer ma demande'}
          </button>

          <p className="demande-contact-privacy">
            En soumettant ce formulaire, vous acceptez notre politique de confidentialité.
          </p>
        </form>
      </div>
    </div>
  );
};

export default DemandeContact;

