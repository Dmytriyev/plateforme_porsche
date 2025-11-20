import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import modelPorscheService from '../services/modelPorsche.service.jsx';
import voitureService from '../services/voiture.service.jsx';
import apiClient from '../config/api.jsx';
import logger from '../utils/logger';
import { /* extractData, */ extractArray } from '../services/httpHelper';
import { Alert } from '../components/common';
import './AjouterVoitureOccasion.css';

const AjouterVoitureOccasion = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const [formData, setFormData] = useState({
    type_voiture: 'Occasion',
    type_model: '',
    type_carrosserie: '',
    annee_production: '',
    couleur_exterieur: '',
    couleur_interieur: '',
    moteur: '',
    transmission: '',
    puissance: '',
    numero_win: '',
    prix_base: '',
    description: '',
    voiture_id: '',
  });

  const [voitures, setVoitures] = useState([]);
  const [couleursExterieur, setCouleursExterieur] = useState([]);
  const [couleursInterieur, setCouleursInterieur] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  // Charger les données nécessaires
  useEffect(() => {
    const loadData = async () => {
      try {
        const [voituresData, extResponse, intResponse] = await Promise.all([
          voitureService.getVoituresOccasion(),
          apiClient.get('/couleur_exterieur/all'),
          apiClient.get('/couleur_interieur/all'),
        ]);
        setVoitures(extractArray(voituresData) || []);
        setCouleursExterieur(extractArray(extResponse) || []);
        setCouleursInterieur(extractArray(intResponse) || []);
      } catch (error) {
        logger.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Vérifier que l'utilisateur est staff ou admin
  useEffect(() => {
    if (!user || (!hasRole('admin') && !hasRole('staff') && !hasRole('conseillere'))) {
      navigate('/');
      return;
    }
  }, [user, hasRole, navigate]);

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

    if (!formData.voiture_id) {
      newErrors.voiture_id = 'Le modèle de base est requis';
    }

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

    if (!formData.moteur.trim()) {
      newErrors.moteur = 'Le moteur est requis';
    }

    if (!formData.transmission.trim()) {
      newErrors.transmission = 'La transmission est requise';
    }

    if (!formData.puissance || parseFloat(formData.puissance) <= 0) {
      newErrors.puissance = 'La puissance est requise et doit être supérieure à 0';
    }

    if (!formData.prix_base || parseFloat(formData.prix_base) <= 0) {
      newErrors.prix_base = 'Le prix de base est requis et doit être supérieur à 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
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
      const modelData = {
        voiture: formData.voiture_id,
        nom_model: formData.type_model,
        type_carrosserie: formData.type_carrosserie,
        annee_production: formData.annee_production ? new Date(formData.annee_production) : undefined,
        specifications: {
          moteur: formData.moteur,
          transmission: formData.transmission,
          puissance: parseFloat(formData.puissance),
          acceleration_0_100: 0,
          vitesse_max: 0,
          consommation: 0,
        },
        prix_base: parseFloat(formData.prix_base),
        description: formData.description,
        couleur_exterieur: formData.couleur_exterieur || undefined,
        couleur_interieur: formData.couleur_interieur ? [formData.couleur_interieur] : undefined,
        numero_vin: formData.numero_win || undefined,
        statut: 'disponible',
        disponible: true,
      };

      // Créer le modèle Porsche d'occasion
      const result = await modelPorscheService.createModel(modelData);

      if (result && result._id) {
        // Si des photos ont été sélectionnées, les uploader une par une
        if (photos.length > 0) {
          try {
            for (const photo of photos) {
              const formDataPhoto = new FormData();
              formDataPhoto.append('photo', photo);
              formDataPhoto.append('model_porsche', result._id);
              await modelPorscheService.addImages(result._id, formDataPhoto);
            }
          } catch (photoError) {
            logger.error('Erreur lors de l\'upload des photos:', photoError);
          }
        }

        navigate('/dashboard/admin');
      } else {
        setErrorMessage('Erreur lors de la création de la voiture d\'occasion');
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

  if (!user || (!hasRole('admin') && !hasRole('staff') && !hasRole('conseillere'))) {
    return null;
  }

  if (loadingData) {
    return <div className="ajouter-voiture-occasion-loading">Chargement...</div>;
  }

  return (
    <div className="ajouter-voiture-occasion-container">
      <div className="ajouter-voiture-occasion-content">
        {/* Bouton Retour */}
        <button
          className="ajouter-voiture-occasion-back"
          onClick={() => navigate(-1)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour
        </button>

        {/* Titre */}
        <h1 className="ajouter-voiture-occasion-title">Ajouter un Porsche</h1>

        {/* Message d'erreur */}
        {errorMessage && (
          <div className="ajouter-voiture-occasion-error">
            <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="ajouter-voiture-occasion-form">
          {/* Type voiture */}
          <div className="ajouter-voiture-occasion-field">
            <label htmlFor="type_voiture" className="ajouter-voiture-occasion-label">
              Type voiture
            </label>
            <input
              id="type_voiture"
              type="text"
              name="type_voiture"
              value={formData.type_voiture}
              onChange={handleChange}
              placeholder="Neuf / Occasion"
              className={`ajouter-voiture-occasion-input ${errors.type_voiture ? 'error' : ''}`}
              readOnly
            />
            {errors.type_voiture && (
              <span className="ajouter-voiture-occasion-field-error">{errors.type_voiture}</span>
            )}
          </div>

          {/* Type modèle (voiture de base) */}
          <div className="ajouter-voiture-occasion-field">
            <label htmlFor="voiture_id" className="ajouter-voiture-occasion-label">
              Type modèle
            </label>
            <select
              id="voiture_id"
              name="voiture_id"
              value={formData.voiture_id}
              onChange={handleChange}
              className={`ajouter-voiture-occasion-input ajouter-voiture-occasion-select ${errors.voiture_id ? 'error' : ''}`}
              required
            >
              <option value="">911 / Cayenne</option>
              {voitures.map((voiture) => (
                <option key={voiture._id} value={voiture._id}>
                  {voiture.nom_model}
                </option>
              ))}
            </select>
            {errors.voiture_id && (
              <span className="ajouter-voiture-occasion-field-error">{errors.voiture_id}</span>
            )}
          </div>

          {/* Nom du modèle (variante) */}
          <div className="ajouter-voiture-occasion-field">
            <label htmlFor="type_model" className="ajouter-voiture-occasion-label">
              Nom du modèle (variante)
            </label>
            <input
              id="type_model"
              type="text"
              name="type_model"
              value={formData.type_model}
              onChange={handleChange}
              placeholder="911 Carrera S / Cayenne Turbo"
              className={`ajouter-voiture-occasion-input ${errors.type_model ? 'error' : ''}`}
              required
            />
            {errors.type_model && (
              <span className="ajouter-voiture-occasion-field-error">{errors.type_model}</span>
            )}
          </div>

          {/* Type carrosserie */}
          <div className="ajouter-voiture-occasion-field">
            <label htmlFor="type_carrosserie" className="ajouter-voiture-occasion-label">
              Type carrosserie
            </label>
            <select
              id="type_carrosserie"
              name="type_carrosserie"
              value={formData.type_carrosserie}
              onChange={handleChange}
              className={`ajouter-voiture-occasion-input ajouter-voiture-occasion-select ${errors.type_carrosserie ? 'error' : ''}`}
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
              <span className="ajouter-voiture-occasion-field-error">{errors.type_carrosserie}</span>
            )}
          </div>

          {/* Année voiture */}
          <div className="ajouter-voiture-occasion-field">
            <label htmlFor="annee_production" className="ajouter-voiture-occasion-label">
              Année voiture
            </label>
            <input
              id="annee_production"
              type="date"
              name="annee_production"
              value={formData.annee_production}
              onChange={handleChange}
              placeholder="Année de production"
              className={`ajouter-voiture-occasion-input ${errors.annee_production ? 'error' : ''}`}
              required
            />
            {errors.annee_production && (
              <span className="ajouter-voiture-occasion-field-error">{errors.annee_production}</span>
            )}
          </div>

          {/* Couleur extérieur */}
          <div className="ajouter-voiture-occasion-field">
            <label htmlFor="couleur_exterieur" className="ajouter-voiture-occasion-label">
              Couleur extérieur
            </label>
            <select
              id="couleur_exterieur"
              name="couleur_exterieur"
              value={formData.couleur_exterieur}
              onChange={handleChange}
              className={`ajouter-voiture-occasion-input ajouter-voiture-occasion-select ${errors.couleur_exterieur ? 'error' : ''}`}
            >
              <option value="">Choisissez couleur de votre Porsche</option>
              {couleursExterieur.map((couleur) => (
                <option key={couleur._id} value={couleur._id}>
                  {couleur.nom_couleur}
                </option>
              ))}
            </select>
            {errors.couleur_exterieur && (
              <span className="ajouter-voiture-occasion-field-error">{errors.couleur_exterieur}</span>
            )}
          </div>

          {/* Couleur intérieur */}
          <div className="ajouter-voiture-occasion-field">
            <label htmlFor="couleur_interieur" className="ajouter-voiture-occasion-label">
              Couleur intérieur
            </label>
            <select
              id="couleur_interieur"
              name="couleur_interieur"
              value={formData.couleur_interieur}
              onChange={handleChange}
              className={`ajouter-voiture-occasion-input ajouter-voiture-occasion-select ${errors.couleur_interieur ? 'error' : ''}`}
            >
              <option value="">Choisissez couleur interieur de votre Porsche</option>
              {couleursInterieur.map((couleur) => (
                <option key={couleur._id} value={couleur._id}>
                  {couleur.nom_couleur}
                </option>
              ))}
            </select>
            {errors.couleur_interieur && (
              <span className="ajouter-voiture-occasion-field-error">{errors.couleur_interieur}</span>
            )}
          </div>

          {/* Moteur */}
          <div className="ajouter-voiture-occasion-field">
            <label htmlFor="moteur" className="ajouter-voiture-occasion-label">
              Moteur
            </label>
            <input
              id="moteur"
              type="text"
              name="moteur"
              value={formData.moteur}
              onChange={handleChange}
              placeholder="Quel est le moteur dans ce Porsche?"
              className={`ajouter-voiture-occasion-input ${errors.moteur ? 'error' : ''}`}
              required
            />
            {errors.moteur && (
              <span className="ajouter-voiture-occasion-field-error">{errors.moteur}</span>
            )}
          </div>

          {/* Transmission */}
          <div className="ajouter-voiture-occasion-field">
            <label htmlFor="transmission" className="ajouter-voiture-occasion-label">
              Transmission
            </label>
            <select
              id="transmission"
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              className={`ajouter-voiture-occasion-input ajouter-voiture-occasion-select ${errors.transmission ? 'error' : ''}`}
              required
            >
              <option value="">Quel est la transmission dans ce Porsche?</option>
              {TYPES_TRANSMISSION.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.transmission && (
              <span className="ajouter-voiture-occasion-field-error">{errors.transmission}</span>
            )}
          </div>

          {/* Puissance */}
          <div className="ajouter-voiture-occasion-field">
            <label htmlFor="puissance" className="ajouter-voiture-occasion-label">
              Puissance
            </label>
            <input
              id="puissance"
              type="number"
              name="puissance"
              value={formData.puissance}
              onChange={handleChange}
              placeholder="Quel est la puissance de ce Porsche?"
              className={`ajouter-voiture-occasion-input ${errors.puissance ? 'error' : ''}`}
              min="0"
              required
            />
            {errors.puissance && (
              <span className="ajouter-voiture-occasion-field-error">{errors.puissance}</span>
            )}
          </div>

          {/* Prix de base */}
          <div className="ajouter-voiture-occasion-field">
            <label htmlFor="prix_base" className="ajouter-voiture-occasion-label">
              Prix de base
            </label>
            <input
              id="prix_base"
              type="number"
              name="prix_base"
              value={formData.prix_base}
              onChange={handleChange}
              placeholder="Prix de base en €"
              className={`ajouter-voiture-occasion-input ${errors.prix_base ? 'error' : ''}`}
              min="0"
              step="0.01"
              required
            />
            {errors.prix_base && (
              <span className="ajouter-voiture-occasion-field-error">{errors.prix_base}</span>
            )}
          </div>

          {/* Description */}
          <div className="ajouter-voiture-occasion-field">
            <label htmlFor="description" className="ajouter-voiture-occasion-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description de la voiture d'occasion"
              className={`ajouter-voiture-occasion-input ajouter-voiture-occasion-textarea ${errors.description ? 'error' : ''}`}
              rows="4"
              required
            />
            {errors.description && (
              <span className="ajouter-voiture-occasion-field-error">{errors.description}</span>
            )}
          </div>

          {/* Numéro WIN */}
          <div className="ajouter-voiture-occasion-field">
            <label htmlFor="numero_win" className="ajouter-voiture-occasion-label">
              Numéro WIN
            </label>
            <input
              id="numero_win"
              type="text"
              name="numero_win"
              value={formData.numero_win}
              onChange={handleChange}
              placeholder="Numéro WIN de ce Porsche"
              className={`ajouter-voiture-occasion-input ${errors.numero_win ? 'error' : ''}`}
              maxLength={17}
            />
            {errors.numero_win && (
              <span className="ajouter-voiture-occasion-field-error">{errors.numero_win}</span>
            )}
          </div>

          {/* Photos */}
          <div className="ajouter-voiture-occasion-field">
            <label htmlFor="photos" className="ajouter-voiture-occasion-label">
              Photos
            </label>
            <label htmlFor="photos" className="ajouter-voiture-occasion-photo-btn">
              Ajouter des photos
              <input
                id="photos"
                type="file"
                name="photos"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="ajouter-voiture-occasion-photo-input"
              />
            </label>
            {photos.length > 0 && (
              <span className="ajouter-voiture-occasion-photo-count">
                {photos.length} photo{photos.length > 1 ? 's' : ''} sélectionnée{photos.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Bouton Soumettre */}
          <button
            type="submit"
            className="ajouter-voiture-occasion-submit"
            disabled={loading}
          >
            {loading ? 'Ajout en cours...' : 'Ajouter un Porsche'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AjouterVoitureOccasion;

