import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import maVoitureService from '../services/ma_voiture.service.jsx';
import apiClient from '../config/api.jsx';
import { extractData, extractArray } from '../services/httpHelper';
import { Alert } from '../components/common';
import './AjouterPorsche.css';

const AjouterPorsche = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    type_voiture: '',
    type_model: '',
    type_carrosserie: '',
    annee_production: '',
    couleur_exterieur: '',
    couleur_interieur: '',
    info_moteur: '',
    info_transmission: '',
    puissance: '',
    numero_win: '',
  });

  const [couleursExterieur, setCouleursExterieur] = useState([]);
  const [couleursInterieur, setCouleursInterieur] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingColors, setLoadingColors] = useState(true);

  // Charger les couleurs disponibles
  useEffect(() => {
    const loadColors = async () => {
      try {
        const [extResponse, intResponse] = await Promise.all([
          apiClient.get('/couleur_exterieur/all'),
          apiClient.get('/couleur_interieur/all'),
        ]);
        setCouleursExterieur(extractArray(extResponse) || []);
        setCouleursInterieur(extractArray(intResponse) || []);
      } catch (error) {
        console.error('Erreur lors du chargement des couleurs:', error);
      } finally {
        setLoadingColors(false);
      }
    };

    loadColors();
  }, []);

  // Vérifier que l'utilisateur est connecté
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

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

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type_model.trim()) {
      newErrors.type_model = 'Le type de modèle est requis';
    }

    if (!formData.type_carrosserie) {
      newErrors.type_carrosserie = 'Le type de carrosserie est requis';
    }

    if (!formData.annee_production) {
      newErrors.annee_production = 'L\'année de production est requise';
    } else {
      const year = new Date(formData.annee_production).getFullYear();
      const currentYear = new Date().getFullYear();
      if (year > currentYear) {
        newErrors.annee_production = 'L\'année ne peut pas être dans le futur';
      }
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
      // Préparer les données pour l'API
      const porscheData = {
        type_model: formData.type_model,
        type_carrosserie: formData.type_carrosserie,
        annee_production: new Date(formData.annee_production),
        info_moteur: formData.info_moteur || undefined,
        info_transmission: formData.info_transmission || undefined,
        numero_win: formData.numero_win || undefined,
        couleur_exterieur: formData.couleur_exterieur || undefined,
        couleur_interieur: formData.couleur_interieur || undefined,
      };

      // Créer le modèle Porsche
      const result = await maVoitureService.ajouterMaVoiture(porscheData);

      if (result && result._id) {
        // Si des photos ont été sélectionnées, les uploader une par une
        if (photos.length > 0) {
          try {
            for (const photo of photos) {
              const formDataPhoto = new FormData();
              formDataPhoto.append('photo', photo);
              formDataPhoto.append('model_porsche_actuel', result._id);
              await maVoitureService.ajouterPhoto(formDataPhoto);
            }
          } catch (photoError) {
            console.error('Erreur lors de l\'upload des photos:', photoError);
          }
        }

        navigate('/mon-compte');
      } else {
        setErrorMessage('Erreur lors de la création du Porsche');
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

  const TYPES_CARROSSERIE = ['Coupe', 'Cabriolet', 'Targa', 'SUV'];
  const TYPES_TRANSMISSION = ['Manuelle', 'PDK', 'Tiptronic'];
  const TYPES_VOITURE = ['Neuf', 'Occasion'];

  if (!user) {
    return null;
  }

  return (
    <div className="ajouter-porsche-container">
      <div className="ajouter-porsche-content">
        {/* Bouton Retour */}
        <button
          className="ajouter-porsche-back"
          onClick={() => navigate(-1)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour
        </button>

        {/* Titre */}
        <h1 className="ajouter-porsche-title">Ajouter un Porsche</h1>

        {/* Message d'erreur */}
        {errorMessage && (
          <div className="ajouter-porsche-error">
            <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="ajouter-porsche-form">
          {/* Type voiture */}
          <div className="ajouter-porsche-field">
            <label htmlFor="type_voiture" className="ajouter-porsche-label">
              Type voiture
            </label>
            <input
              id="type_voiture"
              type="text"
              name="type_voiture"
              value={formData.type_voiture}
              onChange={handleChange}
              placeholder="Neuf / Occasion"
              className={`ajouter-porsche-input ${errors.type_voiture ? 'error' : ''}`}
            />
            {errors.type_voiture && (
              <span className="ajouter-porsche-field-error">{errors.type_voiture}</span>
            )}
          </div>

          {/* Type modèle */}
          <div className="ajouter-porsche-field">
            <label htmlFor="type_model" className="ajouter-porsche-label">
              Type modèle
            </label>
            <input
              id="type_model"
              type="text"
              name="type_model"
              value={formData.type_model}
              onChange={handleChange}
              placeholder="911 / Cayenne"
              className={`ajouter-porsche-input ${errors.type_model ? 'error' : ''}`}
              required
            />
            {errors.type_model && (
              <span className="ajouter-porsche-field-error">{errors.type_model}</span>
            )}
          </div>

          {/* Type carrosserie */}
          <div className="ajouter-porsche-field">
            <label htmlFor="type_carrosserie" className="ajouter-porsche-label">
              Type carrosserie
            </label>
            <select
              id="type_carrosserie"
              name="type_carrosserie"
              value={formData.type_carrosserie}
              onChange={handleChange}
              className={`ajouter-porsche-input ajouter-porsche-select ${errors.type_carrosserie ? 'error' : ''}`}
              required
            >
              <option value="">Coupe / Targa / Cabriolet / SUV</option>
              {TYPES_CARROSSERIE.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.type_carrosserie && (
              <span className="ajouter-porsche-field-error">{errors.type_carrosserie}</span>
            )}
          </div>

          {/* Année voiture */}
          <div className="ajouter-porsche-field">
            <label htmlFor="annee_production" className="ajouter-porsche-label">
              Année voiture
            </label>
            <input
              id="annee_production"
              type="date"
              name="annee_production"
              value={formData.annee_production}
              onChange={handleChange}
              placeholder="Année de production"
              className={`ajouter-porsche-input ${errors.annee_production ? 'error' : ''}`}
              required
            />
            {errors.annee_production && (
              <span className="ajouter-porsche-field-error">{errors.annee_production}</span>
            )}
          </div>

          {/* Couleur extérieur */}
          <div className="ajouter-porsche-field">
            <label htmlFor="couleur_exterieur" className="ajouter-porsche-label">
              Couleur extérieur
            </label>
            <select
              id="couleur_exterieur"
              name="couleur_exterieur"
              value={formData.couleur_exterieur}
              onChange={handleChange}
              className={`ajouter-porsche-input ajouter-porsche-select ${errors.couleur_exterieur ? 'error' : ''}`}
              disabled={loadingColors}
            >
              <option value="">Choisissez couleur de votre Porsche</option>
              {couleursExterieur.map((couleur) => (
                <option key={couleur._id} value={couleur._id}>
                  {couleur.nom_couleur}
                </option>
              ))}
            </select>
            {errors.couleur_exterieur && (
              <span className="ajouter-porsche-field-error">{errors.couleur_exterieur}</span>
            )}
          </div>

          {/* Couleur intérieur */}
          <div className="ajouter-porsche-field">
            <label htmlFor="couleur_interieur" className="ajouter-porsche-label">
              Couleur intérieur
            </label>
            <select
              id="couleur_interieur"
              name="couleur_interieur"
              value={formData.couleur_interieur}
              onChange={handleChange}
              className={`ajouter-porsche-input ajouter-porsche-select ${errors.couleur_interieur ? 'error' : ''}`}
              disabled={loadingColors}
            >
              <option value="">Choisissez couleur interieur de votre Porsche</option>
              {couleursInterieur.map((couleur) => (
                <option key={couleur._id} value={couleur._id}>
                  {couleur.nom_couleur}
                </option>
              ))}
            </select>
            {errors.couleur_interieur && (
              <span className="ajouter-porsche-field-error">{errors.couleur_interieur}</span>
            )}
          </div>

          {/* Moteur */}
          <div className="ajouter-porsche-field">
            <label htmlFor="info_moteur" className="ajouter-porsche-label">
              Moteur
            </label>
            <input
              id="info_moteur"
              type="text"
              name="info_moteur"
              value={formData.info_moteur}
              onChange={handleChange}
              placeholder="Quel est le moteur dans ce Porsche?"
              className={`ajouter-porsche-input ${errors.info_moteur ? 'error' : ''}`}
            />
            {errors.info_moteur && (
              <span className="ajouter-porsche-field-error">{errors.info_moteur}</span>
            )}
          </div>

          {/* Transmission */}
          <div className="ajouter-porsche-field">
            <label htmlFor="info_transmission" className="ajouter-porsche-label">
              Transmission
            </label>
            <select
              id="info_transmission"
              name="info_transmission"
              value={formData.info_transmission}
              onChange={handleChange}
              className={`ajouter-porsche-input ajouter-porsche-select ${errors.info_transmission ? 'error' : ''}`}
            >
              <option value="">Quel est la transmission dans ce Porsche?</option>
              {TYPES_TRANSMISSION.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.info_transmission && (
              <span className="ajouter-porsche-field-error">{errors.info_transmission}</span>
            )}
          </div>

          {/* Puissance */}
          <div className="ajouter-porsche-field">
            <label htmlFor="puissance" className="ajouter-porsche-label">
              Puissance
            </label>
            <input
              id="puissance"
              type="text"
              name="puissance"
              value={formData.puissance}
              onChange={handleChange}
              placeholder="Quel est la puissance de ce Porsche?"
              className={`ajouter-porsche-input ${errors.puissance ? 'error' : ''}`}
            />
            {errors.puissance && (
              <span className="ajouter-porsche-field-error">{errors.puissance}</span>
            )}
          </div>

          {/* Numéro WIN */}
          <div className="ajouter-porsche-field">
            <label htmlFor="numero_win" className="ajouter-porsche-label">
              Numéro WIN
            </label>
            <input
              id="numero_win"
              type="text"
              name="numero_win"
              value={formData.numero_win}
              onChange={handleChange}
              placeholder="Numéro WIN de ce Porsche"
              className={`ajouter-porsche-input ${errors.numero_win ? 'error' : ''}`}
              maxLength={17}
            />
            {errors.numero_win && (
              <span className="ajouter-porsche-field-error">{errors.numero_win}</span>
            )}
          </div>

          {/* Photos */}
          <div className="ajouter-porsche-field">
            <label htmlFor="photos" className="ajouter-porsche-label">
              Photos
            </label>
            <label htmlFor="photos" className="ajouter-porsche-photo-btn">
              Ajouter des photos
              <input
                id="photos"
                type="file"
                name="photos"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="ajouter-porsche-photo-input"
              />
            </label>
            {photos.length > 0 && (
              <span className="ajouter-porsche-photo-count">
                {photos.length} photo{photos.length > 1 ? 's' : ''} sélectionnée{photos.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Bouton Soumettre */}
          <button
            type="submit"
            className="ajouter-porsche-submit"
            disabled={loading}
          >
            {loading ? 'Ajout en cours...' : 'Ajouter un Porsche'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AjouterPorsche;

