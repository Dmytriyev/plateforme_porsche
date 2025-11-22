import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { maVoitureService, personnalisationService } from '../services';
import { Loading } from '../components/common';
import { formatPrice } from '../utils/format.js';
import '../css/AjouterMaVoiture.css';

const AjouterMaVoiture = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Options de personnalisation
    const [couleursExt, setCouleursExt] = useState([]);
    const [couleursInt, setCouleursInt] = useState([]);
    const [jantes, setJantes] = useState([]);
    const [sieges, setSieges] = useState([]);

    // Fichiers photos
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);

    // Formulaire
    const [formData, setFormData] = useState({
        type_model: '',
        annee_production: '',
        couleur_exterieur: '',
        couleur_interieur: '',
        taille_jante: '',
        siege: '',
        info_moteur: '',
        info_transmission: '',
        type_carrosserie: '',
        puissance: '',
        couple: '',
        acceleration: '',
        vitesse_max: '',
        consommation: '',
        prix_base: '',
        package_weissach: false,
        sport_chrono: false,
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setLoading(true);
                setError('');

                const [couleursExtData, couleursIntData, jantesData, siegesData] = await Promise.all([
                    personnalisationService.getCouleursExterieur(),
                    personnalisationService.getCouleursInterieur(),
                    personnalisationService.getJantes(),
                    personnalisationService.getSieges(),
                ]);

                setCouleursExt(couleursExtData);
                setCouleursInt(couleursIntData);
                setJantes(jantesData);
                setSieges(siegesData);
            } catch (err) {
                setError(err.message || 'Erreur lors du chargement des options');
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        // Limiter à 10 photos maximum
        if (photos.length + files.length > 10) {
            setError('Maximum 10 photos autorisées');
            return;
        }

        // Vérifier la taille des fichiers (5MB max par fichier)
        const maxSize = 5 * 1024 * 1024;
        const invalidFiles = files.filter(f => f.size > maxSize);
        if (invalidFiles.length > 0) {
            setError('Certaines photos dépassent 5MB');
            return;
        }

        // Ajouter les nouvelles photos
        setPhotos(prev => [...prev, ...files]);

        // Créer les previews
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            // Préparer les données
            const dataToSend = {
                type_model: formData.type_model,
                annee_production: formData.annee_production,
                couleur_exterieur: formData.couleur_exterieur || undefined,
                couleur_interieur: formData.couleur_interieur || undefined,
                taille_jante: formData.taille_jante || undefined,
                siege: formData.siege || undefined,
                info_moteur: formData.info_moteur || undefined,
                info_transmission: formData.info_transmission || undefined,
                type_carrosserie: formData.type_carrosserie || undefined,
                package_weissach: formData.package_weissach,
                sport_chrono: formData.sport_chrono,
                specifications: {}
            };

            // Ajouter les spécifications si fournies
            if (formData.puissance) dataToSend.specifications.puissance = formData.puissance;
            if (formData.couple) dataToSend.specifications.couple = formData.couple;
            if (formData.acceleration) dataToSend.specifications.acceleration = formData.acceleration;
            if (formData.vitesse_max) dataToSend.specifications.vitesse_max = formData.vitesse_max;
            if (formData.consommation) dataToSend.specifications.consommation = formData.consommation;
            if (formData.prix_base) dataToSend.prix_base_variante = parseFloat(formData.prix_base);

            // Si pas de spécifications, supprimer l'objet vide
            if (Object.keys(dataToSend.specifications).length === 0) {
                delete dataToSend.specifications;
            }

            // Créer la voiture
            const nouvelleVoiture = await maVoitureService.ajouterMaVoiture(dataToSend);

            // Upload des photos si présentes
            if (photos.length > 0) {
                const photoFormData = new FormData();
                photos.forEach(photo => {
                    photoFormData.append('photos', photo);
                });
                photoFormData.append('model_porsche_actuel', nouvelleVoiture._id);
                photoFormData.append('alt', `${formData.type_model} photo`);

                try {
                    await maVoitureService.ajouterPhoto(photoFormData);
                } catch (photoError) {
                    console.error('Erreur upload photos:', photoError);
                    // Ne pas bloquer si l'upload des photos échoue
                }
            }

            setSuccess('Voiture créée avec succès !');
            setTimeout(() => {
                navigate('/mon-compte');
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
        <div className="ajouter-voiture-container">
            {/* Breadcrumb */}
            <div className="ajouter-voiture-breadcrumb">
                <button
                    className="ajouter-voiture-back-btn"
                    onClick={() => navigate('/mon-compte')}
                >
                    ← Retour à mon compte
                </button>
            </div>

            {/* Header */}
            <div className="ajouter-voiture-header">
                <h1 className="ajouter-voiture-title">Ajouter ma voiture</h1>
                <p className="ajouter-voiture-subtitle">Créez votre Porsche personnalisée</p>
            </div>

            <div className="ajouter-voiture-content">
                {/* Messages */}
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

                <form onSubmit={handleSubmit} className="ajouter-voiture-form">
                    {/* Informations de base */}
                    <div className="ajouter-voiture-section">
                        <h2 className="ajouter-voiture-section-title">Informations de base</h2>

                        <div className="ajouter-voiture-form-row">
                            <div className="ajouter-voiture-form-group">
                                <label htmlFor="type_model" className="ajouter-voiture-label">
                                    Modèle * <span className="label-hint">(Ex: 911 GT3 RS)</span>
                                </label>
                                <input
                                    type="text"
                                    id="type_model"
                                    name="type_model"
                                    value={formData.type_model}
                                    onChange={handleChange}
                                    className="ajouter-voiture-input"
                                    required
                                    placeholder="911 GT3 RS"
                                />
                            </div>

                            <div className="ajouter-voiture-form-group">
                                <label htmlFor="type_carrosserie" className="ajouter-voiture-label">
                                    Type de carrosserie
                                </label>
                                <input
                                    type="text"
                                    id="type_carrosserie"
                                    name="type_carrosserie"
                                    value={formData.type_carrosserie}
                                    onChange={handleChange}
                                    className="ajouter-voiture-input"
                                    placeholder="Coupé, Cabriolet, Targa..."
                                />
                            </div>
                        </div>

                        <div className="ajouter-voiture-form-row">
                            <div className="ajouter-voiture-form-group">
                                <label htmlFor="annee_production" className="ajouter-voiture-label">
                                    Année de production *
                                </label>
                                <input
                                    type="date"
                                    id="annee_production"
                                    name="annee_production"
                                    value={formData.annee_production}
                                    onChange={handleChange}
                                    className="ajouter-voiture-input"
                                    required
                                />
                            </div>

                            <div className="ajouter-voiture-form-group">
                                <label htmlFor="prix_base" className="ajouter-voiture-label">
                                    Prix de base (€)
                                </label>
                                <input
                                    type="number"
                                    id="prix_base"
                                    name="prix_base"
                                    value={formData.prix_base}
                                    onChange={handleChange}
                                    className="ajouter-voiture-input"
                                    placeholder="150000"
                                    min="0"
                                    step="1000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Personnalisation */}
                    <div className="ajouter-voiture-section">
                        <h2 className="ajouter-voiture-section-title">Personnalisation</h2>

                        <div className="ajouter-voiture-form-row">
                            <div className="ajouter-voiture-form-group">
                                <label htmlFor="couleur_exterieur" className="ajouter-voiture-label">
                                    Couleur extérieure
                                </label>
                                <select
                                    id="couleur_exterieur"
                                    name="couleur_exterieur"
                                    value={formData.couleur_exterieur}
                                    onChange={handleChange}
                                    className="ajouter-voiture-select"
                                >
                                    <option value="">-- Sélectionner --</option>
                                    {couleursExt.map(couleur => (
                                        <option key={couleur._id} value={couleur._id}>
                                            {couleur.nom_couleur} {couleur.prix > 0 ? `(+${formatPrice(couleur.prix)})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="ajouter-voiture-form-group">
                                <label htmlFor="couleur_interieur" className="ajouter-voiture-label">
                                    Couleur intérieure
                                </label>
                                <select
                                    id="couleur_interieur"
                                    name="couleur_interieur"
                                    value={formData.couleur_interieur}
                                    onChange={handleChange}
                                    className="ajouter-voiture-select"
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

                        <div className="ajouter-voiture-form-row">
                            <div className="ajouter-voiture-form-group">
                                <label htmlFor="taille_jante" className="ajouter-voiture-label">
                                    Jantes
                                </label>
                                <select
                                    id="taille_jante"
                                    name="taille_jante"
                                    value={formData.taille_jante}
                                    onChange={handleChange}
                                    className="ajouter-voiture-select"
                                >
                                    <option value="">-- Sélectionner --</option>
                                    {jantes.map(jante => (
                                        <option key={jante._id} value={jante._id}>
                                            {jante.taille_jante}" - {jante.description} {jante.prix > 0 ? `(+${formatPrice(jante.prix)})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="ajouter-voiture-form-group">
                                <label htmlFor="siege" className="ajouter-voiture-label">
                                    Sièges
                                </label>
                                <select
                                    id="siege"
                                    name="siege"
                                    value={formData.siege}
                                    onChange={handleChange}
                                    className="ajouter-voiture-select"
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
                    </div>

                    {/* Spécifications techniques */}
                    <div className="ajouter-voiture-section">
                        <h2 className="ajouter-voiture-section-title">Spécifications techniques</h2>

                        <div className="ajouter-voiture-form-row">
                            <div className="ajouter-voiture-form-group">
                                <label htmlFor="info_moteur" className="ajouter-voiture-label">
                                    Informations moteur
                                </label>
                                <input
                                    type="text"
                                    id="info_moteur"
                                    name="info_moteur"
                                    value={formData.info_moteur}
                                    onChange={handleChange}
                                    className="ajouter-voiture-input"
                                    placeholder="525 ch / 386 kW"
                                />
                            </div>

                            <div className="ajouter-voiture-form-group">
                                <label htmlFor="info_transmission" className="ajouter-voiture-label">
                                    Transmission
                                </label>
                                <input
                                    type="text"
                                    id="info_transmission"
                                    name="info_transmission"
                                    value={formData.info_transmission}
                                    onChange={handleChange}
                                    className="ajouter-voiture-input"
                                    placeholder="PDK (automatique)"
                                />
                            </div>
                        </div>

                        <div className="ajouter-voiture-form-row">
                            <div className="ajouter-voiture-form-group">
                                <label htmlFor="puissance" className="ajouter-voiture-label">
                                    Puissance (ch)
                                </label>
                                <input
                                    type="text"
                                    id="puissance"
                                    name="puissance"
                                    value={formData.puissance}
                                    onChange={handleChange}
                                    className="ajouter-voiture-input"
                                    placeholder="525 ch"
                                />
                            </div>

                            <div className="ajouter-voiture-form-group">
                                <label htmlFor="couple" className="ajouter-voiture-label">
                                    Couple (Nm)
                                </label>
                                <input
                                    type="text"
                                    id="couple"
                                    name="couple"
                                    value={formData.couple}
                                    onChange={handleChange}
                                    className="ajouter-voiture-input"
                                    placeholder="465 Nm"
                                />
                            </div>
                        </div>

                        <div className="ajouter-voiture-form-row">
                            <div className="ajouter-voiture-form-group">
                                <label htmlFor="acceleration" className="ajouter-voiture-label">
                                    Accélération 0-100 km/h (s)
                                </label>
                                <input
                                    type="text"
                                    id="acceleration"
                                    name="acceleration"
                                    value={formData.acceleration}
                                    onChange={handleChange}
                                    className="ajouter-voiture-input"
                                    placeholder="3.2 s"
                                />
                            </div>

                            <div className="ajouter-voiture-form-group">
                                <label htmlFor="vitesse_max" className="ajouter-voiture-label">
                                    Vitesse max (km/h)
                                </label>
                                <input
                                    type="text"
                                    id="vitesse_max"
                                    name="vitesse_max"
                                    value={formData.vitesse_max}
                                    onChange={handleChange}
                                    className="ajouter-voiture-input"
                                    placeholder="318 km/h"
                                />
                            </div>
                        </div>

                        <div className="ajouter-voiture-form-group">
                            <label htmlFor="consommation" className="ajouter-voiture-label">
                                Consommation (L/100km)
                            </label>
                            <input
                                type="text"
                                id="consommation"
                                name="consommation"
                                value={formData.consommation}
                                onChange={handleChange}
                                className="ajouter-voiture-input"
                                placeholder="13.3 L/100km"
                            />
                        </div>
                    </div>

                    {/* Packages */}
                    <div className="ajouter-voiture-section">
                        <h2 className="ajouter-voiture-section-title">Packages optionnels</h2>

                        <div className="ajouter-voiture-checkbox-group">
                            <label className="ajouter-voiture-checkbox-label">
                                <input
                                    type="checkbox"
                                    name="package_weissach"
                                    checked={formData.package_weissach}
                                    onChange={handleChange}
                                    className="ajouter-voiture-checkbox"
                                />
                                <span>Package Weissach</span>
                            </label>
                        </div>

                        <div className="ajouter-voiture-checkbox-group">
                            <label className="ajouter-voiture-checkbox-label">
                                <input
                                    type="checkbox"
                                    name="sport_chrono"
                                    checked={formData.sport_chrono}
                                    onChange={handleChange}
                                    className="ajouter-voiture-checkbox"
                                />
                                <span>Sport Chrono</span>
                            </label>
                        </div>
                    </div>

                    {/* Photos */}
                    <div className="ajouter-voiture-section">
                        <h2 className="ajouter-voiture-section-title">
                            Photos
                            <span className="label-hint"> (Maximum 10 photos, 5MB par photo)</span>
                        </h2>

                        <div className="ajouter-voiture-upload-area">
                            <input
                                type="file"
                                id="photos"
                                name="photos"
                                accept="image/*"
                                multiple
                                onChange={handlePhotoChange}
                                className="ajouter-voiture-file-input"
                            />
                            <label htmlFor="photos" className="ajouter-voiture-upload-label">
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
                            <div className="ajouter-voiture-photo-grid">
                                {photoPreviews.map((preview, index) => (
                                    <div key={index} className="ajouter-voiture-photo-item">
                                        <img src={preview} alt={`Preview ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="ajouter-voiture-photo-remove"
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
                    <div className="ajouter-voiture-actions">
                        <button
                            type="button"
                            className="ajouter-voiture-btn ajouter-voiture-btn-cancel"
                            onClick={() => navigate('/mon-compte')}
                            disabled={saving}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="ajouter-voiture-btn ajouter-voiture-btn-save"
                            disabled={saving}
                        >
                            {saving ? 'Création en cours...' : 'Créer ma voiture'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AjouterMaVoiture;
