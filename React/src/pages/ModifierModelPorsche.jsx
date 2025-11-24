import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import modelPorscheService from '../services/modelPorsche.service.js';
import voitureService from '../services/voiture.service.js';
import personnalisationService from '../services/personnalisation.service.js';
import Loading from '../components/common/Loading.jsx';
import { formatPrice } from '../utils/helpers.js';
import buildUrl from '../utils/buildUrl';
import '../css/ModifierModelPorsche.css';

// Variantes prédéfinies par modèle (synchronisées avec le backend)
const VARIANTES_PAR_MODELE = {
  '911': ['Carrera S', 'GTS', 'Turbo', 'GT3', 'GT3 RS', 'Targa GTS', 'Targa 4S'],
  'Cayman': ['GTS', 'GT4 RS'],
  'Cayenne': ['E-Hybrid', 'S', 'GTS']
};

// Carrosseries disponibles par modèle (synchronisées avec le backend)
const CARROSSERIES_PAR_MODELE = {
  '911': ['Coupe', 'Cabriolet', 'Targa'],
  'Cayman': ['Coupe'],
  'Cayenne': ['SUV']
};

const ModifierModelPorsche = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modelPorsche, setModelPorsche] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Options
  const [voitures, setVoitures] = useState([]);
  const [couleursExt, setCouleursExt] = useState([]);
  const [couleursInt, setCouleursInt] = useState([]);
  const [jantes, setJantes] = useState([]);
  const [sieges, setSieges] = useState([]);
  const [packages, setPackages] = useState([]);
  const [variantesDisponibles, setVariantesDisponibles] = useState([]);
  const [carrosseriesDisponibles, setCarrosseriesDisponibles] = useState([]);

  // Photos
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [photosExistantes, setPhotosExistantes] = useState([]);
  const [photosASupprimer, setPhotosASupprimer] = useState([]);

  // Formulaire
  const [formData, setFormData] = useState({
    voiture: '',
    nom_model: '',
    type_carrosserie: '',
    prix_base: '',
    description: '',
    numero_vin: '',
    concessionnaire: '',
    couleur_exterieur: '',
    couleur_interieur: '',
    taille_jante: '',
    siege: '',
    package: [],
    // Spécifications
    moteur: '',
    puissance: '',
    couple: '',
    transmission: 'PDK',
    acceleration_0_100: '',
    vitesse_max: '',
    consommation: '',
    pack_sport_chrono: false,
    pack_weissach: false,
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError('');

        const [modelData, voituresData, couleursExtData, couleursIntData, jantesData, siegesData, packagesData] =
          await Promise.all([
            modelPorscheService.getModelById(id),
            voitureService.getVoituresOccasion(),
            personnalisationService.getCouleursExterieur(),
            personnalisationService.getCouleursInterieur(),
            personnalisationService.getJantes(),
            personnalisationService.getSieges(),
            personnalisationService.getPackages(),
          ]);

        setModelPorsche(modelData);
        // getVoituresOccasion() retourne déjà uniquement les voitures d'occasion
        setVoitures(voituresData || []);
        setCouleursExt(couleursExtData);
        setCouleursInt(couleursIntData);
        setJantes(jantesData);
        setSieges(siegesData);
        setPackages(packagesData);

        // Charger photos existantes
        if (Array.isArray(modelData.photo_porsche)) {
          setPhotosExistantes(modelData.photo_porsche);
        }

        // Initialiser les variantes et carrosseries disponibles selon le modèle
        const nomModele = modelData.voiture?.nom_model || '';
        const variantes = VARIANTES_PAR_MODELE[nomModele] || [];
        const carrosseries = CARROSSERIES_PAR_MODELE[nomModele] || [];
        setVariantesDisponibles(variantes);
        setCarrosseriesDisponibles(carrosseries);

        // Pré-remplir le formulaire
        setFormData({
          voiture: modelData.voiture?._id || '',
          nom_model: modelData.nom_model || '',
          type_carrosserie: modelData.type_carrosserie || '',
          prix_base: modelData.prix_base || '',
          description: modelData.description || '',
          numero_vin: modelData.numero_vin || '',
          concessionnaire: modelData.concessionnaire || '',
          couleur_exterieur: modelData.couleur_exterieur?._id || '',
          couleur_interieur: modelData.couleur_interieur?._id || '',
          taille_jante: modelData.taille_jante?._id || '',
          siege: modelData.siege?._id || '',
          package: Array.isArray(modelData.package) ? modelData.package.map(p => p._id || p) : [],
          moteur: modelData.specifications?.moteur || '',
          puissance: modelData.specifications?.puissance || '',
          couple: modelData.specifications?.couple || '',
          transmission: modelData.specifications?.transmission || 'PDK',
          acceleration_0_100: modelData.specifications?.acceleration_0_100 || '',
          vitesse_max: modelData.specifications?.vitesse_max || '',
          consommation: modelData.specifications?.consommation || '',
        });
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOptions();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'voiture' && value) {
      const voitureSelectionnee = voitures.find(v => v._id === value);
      if (voitureSelectionnee) {
        const nomModele = voitureSelectionnee.nom_model || '';
        const variantes = VARIANTES_PAR_MODELE[nomModele] || [];
        const carrosseries = CARROSSERIES_PAR_MODELE[nomModele] || [];

        setVariantesDisponibles(variantes);
        setCarrosseriesDisponibles(carrosseries);
        setFormData(prev => ({
          ...prev,
          voiture: value,
          nom_model: prev.nom_model, // Conserver la variante actuelle si elle existe
          type_carrosserie: prev.type_carrosserie // Conserver la carrosserie actuelle
        }));
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePackageChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      package: checked
        ? [...prev.package, value]
        : prev.package.filter(p => p !== value)
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    if (photos.length + files.length > 15) {
      setError('Maximum 15 photos autorisées');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    const invalidFiles = files.filter(f => f.size > maxSize);
    if (invalidFiles.length > 0) {
      setError('Certaines photos dépassent 5MB');
      return;
    }

    setPhotos(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setError('');
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const supprimerPhotoExistante = (photoId) => {
    setPhotosASupprimer(prev => [...prev, photoId]);
  };

  const annulerSuppressionPhoto = (photoId) => {
    setPhotosASupprimer(prev => prev.filter(id => id !== photoId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Préparer les données
      const dataToSend = {
        voiture: formData.voiture,
        nom_model: formData.nom_model,
        type_carrosserie: formData.type_carrosserie || undefined,
        prix_base: parseFloat(formData.prix_base) || 0,
        description: formData.description || undefined,
        numero_vin: formData.numero_vin || undefined,
        concessionnaire: formData.concessionnaire || undefined,
        couleur_exterieur: formData.couleur_exterieur || undefined,
        couleur_interieur: formData.couleur_interieur || undefined,
        taille_jante: formData.taille_jante || undefined,
        siege: formData.siege || undefined,
        package: formData.package.length > 0 ? formData.package : undefined,
        specifications: {}
      };

      // Ajouter les spécifications (obligatoires selon le modèle)
      if (formData.moteur) dataToSend.specifications.moteur = formData.moteur;
      if (formData.puissance) dataToSend.specifications.puissance = parseFloat(formData.puissance);
      if (formData.couple) dataToSend.specifications.couple = parseFloat(formData.couple);
      if (formData.transmission) dataToSend.specifications.transmission = formData.transmission;
      if (formData.acceleration_0_100) dataToSend.specifications.acceleration_0_100 = parseFloat(formData.acceleration_0_100);
      if (formData.vitesse_max) dataToSend.specifications.vitesse_max = parseFloat(formData.vitesse_max);
      if (formData.consommation) dataToSend.specifications.consommation = parseFloat(formData.consommation);

      // Si aucune spécification n'est fournie, supprimer l'objet
      if (Object.keys(dataToSend.specifications).length === 0) {
        delete dataToSend.specifications;
      }

      // Mettre à jour le model_porsche
      await modelPorscheService.updateModelPorsche(id, dataToSend);

      // Supprimer les photos marquées
      if (photosASupprimer.length > 0) {
        try {
          await modelPorscheService.supprimerPhotos(id, { photo_porsche: photosASupprimer });
        } catch (photoError) {
        }
      }

      // Upload des nouvelles photos
      if (photos.length > 0) {
        const photoFormData = new FormData();
        photos.forEach(photo => {
          photoFormData.append('photos', photo);
        });
        photoFormData.append('model_porsche', id);
        photoFormData.append('alt', `${formData.nom_model} photo`);

        try {
          await modelPorscheService.ajouterPhotos(id, photoFormData);
        } catch (photoError) {
        }
      }

      setSuccess('Voiture modifiée avec succès !');
      setTimeout(() => {
        navigate(`/occasion/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Chargement..." />;
  }

  return (
    <div className="ajouter-model-porsche-container">
      <div className="ajouter-model-porsche-breadcrumb">
        <button
          className="ajouter-model-porsche-back-btn"
          onClick={() => navigate(-1)}
        >
          ← Retour
        </button>
      </div>

      <div className="ajouter-model-porsche-header">
        <h1 className="ajouter-model-porsche-title">Modifier la voiture</h1>
        <p className="ajouter-model-porsche-subtitle">Modifiez les informations de la voiture</p>
      </div>

      <div className="ajouter-model-porsche-content">
        {error && (
          <div className="message-box message-error">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="message-box message-success">
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="ajouter-model-porsche-form">
          {/* Informations de base */}
          <div className="ajouter-model-porsche-section">
            <h2 className="ajouter-model-porsche-section-title">Informations de base</h2>

            <div className="ajouter-model-porsche-form-row">
              <div className="ajouter-model-porsche-form-group">
                <label htmlFor="voiture" className="ajouter-model-porsche-label">
                  Modèle de base * <span className="label-hint">(911, Cayenne, etc.)</span>
                </label>
                <select
                  id="voiture"
                  name="voiture"
                  value={formData.voiture}
                  onChange={handleChange}
                  className="ajouter-model-porsche-select"
                  required
                >
                  <option value="">-- Sélectionner --</option>
                  {voitures
                    .filter((voiture, index, self) =>
                      index === self.findIndex((v) => v.nom_model === voiture.nom_model)
                    )
                    .map(voiture => (
                      <option key={voiture._id} value={voiture._id}>
                        {voiture.nom_model}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="ajouter-model-porsche-form-group">
                <label htmlFor="nom_model" className="ajouter-model-porsche-label">
                  Variante * <span className="label-hint">(Carrera S, GTS, Turbo, etc.)</span>
                </label>
                <select
                  id="nom_model"
                  name="nom_model"
                  value={formData.nom_model}
                  onChange={handleChange}
                  className="ajouter-model-porsche-select"
                  required
                  disabled={!formData.voiture || variantesDisponibles.length === 0}
                >
                  <option value="">-- Sélectionner une variante --</option>
                  {variantesDisponibles.map((variante, index) => (
                    <option key={index} value={variante}>
                      {variante}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="ajouter-model-porsche-form-row">
              <div className="ajouter-model-porsche-form-group">
                <label htmlFor="type_carrosserie" className="ajouter-model-porsche-label">
                  Type de carrosserie
                </label>
                <select
                  id="type_carrosserie"
                  name="type_carrosserie"
                  value={formData.type_carrosserie}
                  onChange={handleChange}
                  className="ajouter-model-porsche-select"
                  disabled={!formData.voiture || carrosseriesDisponibles.length === 0}
                >
                  <option value="">-- Sélectionner --</option>
                  {carrosseriesDisponibles.map((carrosserie, index) => (
                    <option key={index} value={carrosserie}>
                      {carrosserie}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="ajouter-model-porsche-form-group">
              <label htmlFor="prix_base" className="ajouter-model-porsche-label">
                Prix (€) *
              </label>
              <input
                type="number"
                id="prix_base"
                name="prix_base"
                value={formData.prix_base}
                onChange={handleChange}
                className="ajouter-model-porsche-input"
                required
                placeholder="85000"
                min="0"
                step="1000"
              />
            </div>

            <div className="ajouter-model-porsche-form-group">
              <label htmlFor="description" className="ajouter-model-porsche-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="ajouter-model-porsche-textarea"
                rows="4"
                placeholder="Description détaillée du véhicule..."
              />
            </div>
          </div>

          {/* Informations concessionnaire */}
          <div className="ajouter-model-porsche-section">
            <h2 className="ajouter-model-porsche-section-title">Informations concessionnaire</h2>

            <div className="ajouter-model-porsche-form-row">
              <div className="ajouter-model-porsche-form-group">
                <label htmlFor="numero_vin" className="ajouter-model-porsche-label">
                  Numéro VIN
                </label>
                <input
                  type="text"
                  id="numero_vin"
                  name="numero_vin"
                  value={formData.numero_vin}
                  onChange={handleChange}
                  className="ajouter-model-porsche-input"
                  placeholder="WP0ZZZ99ZTS392155"
                />
              </div>

              <div className="ajouter-model-porsche-form-group">
                <label htmlFor="concessionnaire" className="ajouter-model-porsche-label">
                  Concessionnaire
                </label>
                <input
                  type="text"
                  id="concessionnaire"
                  name="concessionnaire"
                  value={formData.concessionnaire}
                  onChange={handleChange}
                  className="ajouter-model-porsche-input"
                  placeholder="Porsche Centre Paris"
                />
              </div>
            </div>

            <div className="ajouter-model-porsche-form-group">
              <label htmlFor="adresse" className="ajouter-model-porsche-label">
                Adresse
              </label>
              <input
                type="text"
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                className="ajouter-model-porsche-input"
                placeholder="123 Avenue des Champs-Élysées, 75008 Paris"
              />
            </div>
          </div>

          {/* Personnalisation */}
          <div className="ajouter-model-porsche-section">
            <h2 className="ajouter-model-porsche-section-title">Personnalisation</h2>

            <div className="ajouter-model-porsche-form-row">
              <div className="ajouter-model-porsche-form-group">
                <label htmlFor="couleur_exterieur" className="ajouter-model-porsche-label">
                  Couleur extérieure
                </label>
                <select
                  id="couleur_exterieur"
                  name="couleur_exterieur"
                  value={formData.couleur_exterieur}
                  onChange={handleChange}
                  className="ajouter-model-porsche-select"
                >
                  <option value="">-- Sélectionner --</option>
                  {couleursExt.map(couleur => (
                    <option key={couleur._id} value={couleur._id}>
                      {couleur.nom_couleur} {couleur.prix > 0 ? `(+${formatPrice(couleur.prix)})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ajouter-model-porsche-form-group">
                <label htmlFor="couleur_interieur" className="ajouter-model-porsche-label">
                  Couleur intérieure
                </label>
                <select
                  id="couleur_interieur"
                  name="couleur_interieur"
                  value={formData.couleur_interieur}
                  onChange={handleChange}
                  className="ajouter-model-porsche-select"
                >
                  <option value="">-- Sélectionner --</option>
                  {couleursInt.map(couleur => (
                    <option key={couleur._id} value={couleur._id}>
                      {couleur.nom_couleur} {couleur.prix > 0 ? `(+${formatPrice(couleur.prix)})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="ajouter-model-porsche-form-row">
              <div className="ajouter-model-porsche-form-group">
                <label htmlFor="taille_jante" className="ajouter-model-porsche-label">
                  Jantes
                </label>
                <select
                  id="taille_jante"
                  name="taille_jante"
                  value={formData.taille_jante}
                  onChange={handleChange}
                  className="ajouter-model-porsche-select"
                >
                  <option value="">-- Sélectionner --</option>
                  {jantes.map(jante => (
                    <option key={jante._id} value={jante._id}>
                      {jante.taille_jante}" - {jante.description} {jante.prix > 0 ? `(+${formatPrice(jante.prix)})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ajouter-model-porsche-form-group">
                <label htmlFor="siege" className="ajouter-model-porsche-label">
                  Sièges
                </label>
                <select
                  id="siege"
                  name="siege"
                  value={formData.siege}
                  onChange={handleChange}
                  className="ajouter-model-porsche-select"
                >
                  <option value="">-- Sélectionner --</option>
                  {sieges.map(siege => (
                    <option key={siege._id} value={siege._id}>
                      {siege.type_siege} {siege.prix > 0 ? `(+${formatPrice(siege.prix)})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Packages */}
            <div className="ajouter-model-porsche-form-group">
              <label className="ajouter-model-porsche-label">Packages</label>
              <div className="ajouter-model-porsche-checkbox-list">
                {packages.map(pkg => (
                  <label key={pkg._id} className="ajouter-model-porsche-checkbox-label">
                    <input
                      type="checkbox"
                      value={pkg._id}
                      checked={formData.package.includes(pkg._id)}
                      onChange={handlePackageChange}
                      className="ajouter-model-porsche-checkbox"
                    />
                    <span>{pkg.nom_package} {pkg.prix > 0 ? `(+${formatPrice(pkg.prix)})` : ''}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Spécifications techniques */}
          <div className="ajouter-model-porsche-section">
            <h2 className="ajouter-model-porsche-section-title">Spécifications techniques</h2>

            <div className="ajouter-model-porsche-form-group">
              <label htmlFor="moteur" className="ajouter-model-porsche-label">
                Moteur *
              </label>
              <input
                type="text"
                id="moteur"
                name="moteur"
                value={formData.moteur}
                onChange={handleChange}
                className="ajouter-model-porsche-input"
                placeholder="Flat-6 4.0L bi-turbo"
                required
              />
            </div>

            <div className="ajouter-model-porsche-form-row">
              <div className="ajouter-model-porsche-form-group">
                <label htmlFor="puissance" className="ajouter-model-porsche-label">
                  Puissance (ch) *
                </label>
                <input
                  type="number"
                  id="puissance"
                  name="puissance"
                  value={formData.puissance}
                  onChange={handleChange}
                  className="ajouter-model-porsche-input"
                  placeholder="385"
                  min="0"
                  required
                />
              </div>

              <div className="ajouter-model-porsche-form-group">
                <label htmlFor="couple" className="ajouter-model-porsche-label">
                  Couple (Nm)
                </label>
                <input
                  type="number"
                  id="couple"
                  name="couple"
                  value={formData.couple}
                  onChange={handleChange}
                  className="ajouter-model-porsche-input"
                  placeholder="450"
                  min="0"
                />
              </div>
            </div>

            <div className="ajouter-model-porsche-form-row">
              <div className="ajouter-model-porsche-form-group">
                <label htmlFor="transmission" className="ajouter-model-porsche-label">
                  Transmission *
                </label>
                <select
                  id="transmission"
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="ajouter-model-porsche-select"
                  required
                >
                  <option value="PDK">PDK</option>
                  <option value="Manuelle">Manuelle</option>
                  <option value="Tiptronic">Tiptronic</option>
                </select>
              </div>

              <div className="ajouter-model-porsche-form-group">
                <label htmlFor="acceleration_0_100" className="ajouter-model-porsche-label">
                  Accélération 0-100 km/h (s) *
                </label>
                <input
                  type="number"
                  id="acceleration_0_100"
                  name="acceleration_0_100"
                  value={formData.acceleration_0_100}
                  onChange={handleChange}
                  className="ajouter-model-porsche-input"
                  placeholder="4.2"
                  step="0.1"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="ajouter-model-porsche-form-row">
              <div className="ajouter-model-porsche-form-group">
                <label htmlFor="vitesse_max" className="ajouter-model-porsche-label">
                  Vitesse max (km/h) *
                </label>
                <input
                  type="number"
                  id="vitesse_max"
                  name="vitesse_max"
                  value={formData.vitesse_max}
                  onChange={handleChange}
                  className="ajouter-model-porsche-input"
                  placeholder="293"
                  min="0"
                  required
                />
              </div>

              <div className="ajouter-model-porsche-form-group">
                <label htmlFor="consommation" className="ajouter-model-porsche-label">
                  Consommation (L/100km) *
                </label>
                <input
                  type="number"
                  id="consommation"
                  name="consommation"
                  value={formData.consommation}
                  onChange={handleChange}
                  className="ajouter-model-porsche-input"
                  placeholder="10.5"
                  step="0.1"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="ajouter-model-porsche-section">
            <h2 className="ajouter-model-porsche-section-title">
              Photos
              <span className="label-hint"> (Maximum 15 photos, 5MB par photo)</span>
            </h2>

            <div className="ajouter-model-porsche-upload-area">
              <input
                type="file"
                id="photos"
                name="photos"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="ajouter-model-porsche-file-input"
              />
              <label htmlFor="photos" className="ajouter-model-porsche-upload-label">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Cliquez pour ajouter des photos</span>
                <span className="upload-hint">ou glissez-déposez vos images ici</span>
              </label>
            </div>

            {photoPreviews.length > 0 && (
              <div className="ajouter-model-porsche-photo-grid">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="ajouter-model-porsche-photo-item">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="ajouter-model-porsche-photo-remove"
                      onClick={() => removePhoto(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="ajouter-model-porsche-actions">
            <button
              type="button"
              className="ajouter-model-porsche-btn ajouter-model-porsche-btn-cancel"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="ajouter-model-porsche-btn ajouter-model-porsche-btn-save"
              disabled={saving}
            >
              {saving ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form >
      </div >
    </div >
  );
};

export default ModifierModelPorsche;
