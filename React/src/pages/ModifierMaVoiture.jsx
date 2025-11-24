import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import maVoitureService from '../services/ma_voiture.service.js';
import personnalisationService from '../services/personnalisation.service.js';
import Loading from '../components/common/Loading.jsx';
import buildUrl from '../utils/buildUrl';
import { formatPrice } from '../utils/helpers.js';
import '../css/ModifierMaVoiture.css';

const ModifierMaVoiture = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Données de la voiture
    const [voiture, setVoiture] = useState(null);

    // Options de personnalisation
    const [couleursExt, setCouleursExt] = useState([]);
    const [couleursInt, setCouleursInt] = useState([]);
    const [jantes, setJantes] = useState([]);
    const [sieges, setSieges] = useState([]);

    // Photos
    const [photosExistantes, setPhotosExistantes] = useState([]);
    const [nouvellesPhotos, setNouvellesPhotos] = useState([]);
    const [photosPreviews, setPhotosPreviews] = useState([]);
    const [photosASupprimer, setPhotosASupprimer] = useState([]);

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
        package_weissach: false,
        sport_chrono: false,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');

                // Charger la voiture et les options en parallèle
                const [voitureData, couleursExtData, couleursIntData, jantesData, siegesData] = await Promise.all([
                    maVoitureService.getMaVoitureById(id),
                    personnalisationService.getCouleursExterieur(),
                    personnalisationService.getCouleursInterieur(),
                    personnalisationService.getJantes(),
                    personnalisationService.getSieges(),
                ]);

                setVoiture(voitureData);
                setCouleursExt(couleursExtData);
                setCouleursInt(couleursIntData);
                setJantes(jantesData);
                setSieges(siegesData);

                // Charger les photos existantes
                if (Array.isArray(voitureData.photo_voiture_actuel)) {
                    setPhotosExistantes(voitureData.photo_voiture_actuel);
                }

                // Pré-remplir le formulaire
                setFormData({
                    type_model: voitureData.type_model || '',
                    annee_production: voitureData.annee_production ?
                        new Date(voitureData.annee_production).toISOString().split('T')[0] : '',
                    couleur_exterieur: voitureData.couleur_exterieur?._id || '',
                    couleur_interieur: voitureData.couleur_interieur?._id || '',
                    taille_jante: voitureData.taille_jante?._id || '',
                    siege: voitureData.siege?._id || '',
                    info_moteur: voitureData.info_moteur || '',
                    info_transmission: voitureData.info_transmission || '',
                    package_weissach: voitureData.package_weissach || false,
                    sport_chrono: voitureData.sport_chrono || false,
                });
            } catch (err) {
                setError(err.message || 'Erreur lors du chargement des données');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

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

        // Limiter à 10 photos au total
        const totalPhotos = photosExistantes.length - photosASupprimer.length + nouvellesPhotos.length + files.length;
        if (totalPhotos > 10) {
            setError('Maximum 10 photos au total');
            return;
        }

        // Vérifier la taille des fichiers (5MB max)
        const maxSize = 5 * 1024 * 1024;
        const invalidFiles = files.filter(f => f.size > maxSize);
        if (invalidFiles.length > 0) {
            setError('Certaines photos dépassent 5MB');
            return;
        }

        setNouvellesPhotos(prev => [...prev, ...files]);

        // Créer les previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotosPreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });

        setError('');
    };

    const supprimerPhotoExistante = (photoId) => {
        setPhotosASupprimer(prev => [...prev, photoId]);
    };

    const annulerSuppressionPhoto = (photoId) => {
        setPhotosASupprimer(prev => prev.filter(id => id !== photoId));
    };

    const supprimerNouvellePhoto = (index) => {
        setNouvellesPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotosPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            // Préparer les données pour l'API
            const updateData = {
                type_model: formData.type_model,
                annee_production: formData.annee_production,
                couleur_exterieur: formData.couleur_exterieur || undefined,
                couleur_interieur: formData.couleur_interieur || undefined,
                taille_jante: formData.taille_jante || undefined,
                siege: formData.siege || undefined,
                info_moteur: formData.info_moteur || undefined,
                info_transmission: formData.info_transmission || undefined,
                package_weissach: formData.package_weissach,
                sport_chrono: formData.sport_chrono,
            };

            await maVoitureService.updateMaVoiture(id, updateData);

            // Supprimer les photos marquées pour suppression
            if (photosASupprimer.length > 0) {
                try {
                    await maVoitureService.supprimerPhotos(id, { photo_voiture_actuel: photosASupprimer });
                } catch (photoError) {
                    setError('Erreur lors de la suppression des photos');
                }
            }

            // Ajouter les nouvelles photos
            if (nouvellesPhotos.length > 0) {
                const photoFormData = new FormData();
                nouvellesPhotos.forEach(photo => {
                    photoFormData.append('photos', photo);
                });
                photoFormData.append('model_porsche_actuel', id);
                photoFormData.append('alt', `${formData.type_model} photo`);

                try {
                    await maVoitureService.ajouterPhoto(photoFormData);
                } catch (photoError) {
                    setError('Erreur lors de l\'ajout des photos');
                }
            }

            setSuccess('Voiture modifiée avec succès !');
            setTimeout(() => {
                navigate(`/mes-voitures/${id}`);
            }, 1500);
        } catch (err) {
            setError(err.message || 'Erreur lors de la modification');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loading fullScreen message="Chargement..." />;
    }

    if (!voiture) {
        return (
            <div className="modifier-voiture-error">
                <p>Voiture introuvable</p>
                <button onClick={() => navigate('/mon-compte')}>Retour à mon compte</button>
            </div>
        );
    }

    const photoPrincipale = voiture.photo_voiture_actuel?.[0];

    return (
        <div className="modifier-voiture-container">
            {/* Breadcrumb */}
            <div className="modifier-voiture-breadcrumb">
                <button
                    className="modifier-voiture-back-btn"
                    onClick={() => navigate(`/mes-voitures/${id}`)}
                >
                    ← Retour aux détails
                </button>
            </div>

            {/* Header */}
            <div className="modifier-voiture-header">
                <h1 className="modifier-voiture-title">Modifier ma voiture</h1>
                <p className="modifier-voiture-subtitle">{voiture.type_model || 'Porsche'}</p>
            </div>

            <div className="modifier-voiture-content">
                {/* Image de la voiture */}
                <div className="modifier-voiture-preview">
                    {photoPrincipale && photoPrincipale.name ? (
                        <img
                            src={buildUrl(photoPrincipale.name)}
                            alt={voiture.type_model}
                            className="modifier-voiture-img"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <div className="modifier-voiture-no-photo">
                            <span>{voiture.type_model?.charAt(0) || 'P'}</span>
                        </div>
                    )}
                </div>

                {/* Formulaire */}
                <div className="modifier-voiture-form-wrapper">
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

                    <form onSubmit={handleSubmit} className="modifier-voiture-form">
                        {/* Informations de base */}
                        <div className="modifier-voiture-section">
                            <h2 className="modifier-voiture-section-title">Informations de base</h2>

                            <div className="modifier-voiture-form-group">
                                <label htmlFor="type_model" className="modifier-voiture-label">
                                    Modèle *
                                </label>
                                <input
                                    type="text"
                                    id="type_model"
                                    name="type_model"
                                    value={formData.type_model}
                                    onChange={handleChange}
                                    className="modifier-voiture-input"
                                    required
                                    placeholder="Ex: 911 GT3 RS"
                                />
                            </div>

                            <div className="modifier-voiture-form-group">
                                <label htmlFor="annee_production" className="modifier-voiture-label">
                                    Année de production *
                                </label>
                                <input
                                    type="date"
                                    id="annee_production"
                                    name="annee_production"
                                    value={formData.annee_production}
                                    onChange={handleChange}
                                    className="modifier-voiture-input"
                                    required
                                />
                            </div>
                        </div>

                        {/* Personnalisation */}
                        <div className="modifier-voiture-section">
                            <h2 className="modifier-voiture-section-title">Personnalisation</h2>

                            <div className="modifier-voiture-form-group">
                                <label htmlFor="couleur_exterieur" className="modifier-voiture-label">
                                    Couleur extérieure
                                </label>
                                <select
                                    id="couleur_exterieur"
                                    name="couleur_exterieur"
                                    value={formData.couleur_exterieur}
                                    onChange={handleChange}
                                    className="modifier-voiture-select"
                                >
                                    <option value="">-- Sélectionner --</option>
                                    {couleursExt.map(couleur => (
                                        <option key={couleur._id} value={couleur._id}>
                                            {couleur.nom_couleur} {couleur.prix > 0 ? `(+${formatPrice(couleur.prix)})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modifier-voiture-form-group">
                                <label htmlFor="couleur_interieur" className="modifier-voiture-label">
                                    Couleur intérieure
                                </label>
                                <select
                                    id="couleur_interieur"
                                    name="couleur_interieur"
                                    value={formData.couleur_interieur}
                                    onChange={handleChange}
                                    className="modifier-voiture-select"
                                >
                                    <option value="">-- Sélectionner --</option>
                                    {couleursInt.map(couleur => (
                                        <option key={couleur._id} value={couleur._id}>
                                            {couleur.nom_couleur} {couleur.prix > 0 ? `(+${formatPrice(couleur.prix)})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modifier-voiture-form-group">
                                <label htmlFor="taille_jante" className="modifier-voiture-label">
                                    Jantes
                                </label>
                                <select
                                    id="taille_jante"
                                    name="taille_jante"
                                    value={formData.taille_jante}
                                    onChange={handleChange}
                                    className="modifier-voiture-select"
                                >
                                    <option value="">-- Sélectionner --</option>
                                    {jantes.map(jante => (
                                        <option key={jante._id} value={jante._id}>
                                            {jante.taille_jante}" - {jante.description} {jante.prix > 0 ? `(+${formatPrice(jante.prix)})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modifier-voiture-form-group">
                                <label htmlFor="siege" className="modifier-voiture-label">
                                    Sièges
                                </label>
                                <select
                                    id="siege"
                                    name="siege"
                                    value={formData.siege}
                                    onChange={handleChange}
                                    className="modifier-voiture-select"
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

                        {/* Spécifications techniques */}
                        <div className="modifier-voiture-section">
                            <h2 className="modifier-voiture-section-title">Spécifications techniques</h2>

                            <div className="modifier-voiture-form-group">
                                <label htmlFor="info_moteur" className="modifier-voiture-label">
                                    Informations moteur
                                </label>
                                <input
                                    type="text"
                                    id="info_moteur"
                                    name="info_moteur"
                                    value={formData.info_moteur}
                                    onChange={handleChange}
                                    className="modifier-voiture-input"
                                    placeholder="Ex: 525 ch / 386 kW"
                                />
                            </div>

                            <div className="modifier-voiture-form-group">
                                <label htmlFor="info_transmission" className="modifier-voiture-label">
                                    Transmission
                                </label>
                                <input
                                    type="text"
                                    id="info_transmission"
                                    name="info_transmission"
                                    value={formData.info_transmission}
                                    onChange={handleChange}
                                    className="modifier-voiture-input"
                                    placeholder="Ex: PDK (automatique)"
                                />
                            </div>
                        </div>

                        {/* Packages */}
                        <div className="modifier-voiture-section">
                            <h2 className="modifier-voiture-section-title">Packages optionnels</h2>

                            <div className="modifier-voiture-checkbox-group">
                                <label className="modifier-voiture-checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="package_weissach"
                                        checked={formData.package_weissach}
                                        onChange={handleChange}
                                        className="modifier-voiture-checkbox"
                                    />
                                    <span>Package Weissach</span>
                                </label>
                            </div>

                            <div className="modifier-voiture-checkbox-group">
                                <label className="modifier-voiture-checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="sport_chrono"
                                        checked={formData.sport_chrono}
                                        onChange={handleChange}
                                        className="modifier-voiture-checkbox"
                                    />
                                    <span>Sport Chrono</span>
                                </label>
                            </div>
                        </div>

                        {/* Photos */}
                        <div className="modifier-voiture-section">
                            <h2 className="modifier-voiture-section-title">
                                Gérer les photos
                                <span className="label-hint"> (Maximum 10 photos au total)</span>
                            </h2>

                            {/* Photos existantes */}
                            {photosExistantes.length > 0 && (
                                <div className="modifier-voiture-photos-existantes">
                                    <h3 className="modifier-voiture-subsection-title">Photos actuelles</h3>
                                    <div className="modifier-voiture-photo-grid">
                                        {photosExistantes.map((photo) => {
                                            const estMarqueeSuppr = photosASupprimer.includes(photo._id);
                                            return (
                                                <div
                                                    key={photo._id}
                                                    className={`modifier-voiture-photo-item ${estMarqueeSuppr ? 'marked-delete' : ''}`}
                                                >
                                                    <img
                                                        src={buildUrl(photo.name)}
                                                        alt={photo.alt || 'Photo voiture'}
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                    {estMarqueeSuppr ? (
                                                        <button
                                                            type="button"
                                                            className="modifier-voiture-photo-restore"
                                                            onClick={() => annulerSuppressionPhoto(photo._id)}
                                                            title="Annuler la suppression"
                                                        >
                                                            ↶
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="modifier-voiture-photo-remove"
                                                            onClick={() => supprimerPhotoExistante(photo._id)}
                                                            title="Supprimer cette photo"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Ajouter de nouvelles photos */}
                            <div className="modifier-voiture-upload-area">
                                <input
                                    type="file"
                                    id="photos"
                                    name="photos"
                                    accept="image/*"
                                    multiple
                                    onChange={handlePhotoChange}
                                    className="modifier-voiture-file-input"
                                />
                                <label htmlFor="photos" className="modifier-voiture-upload-label">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    <span>Ajouter des photos</span>
                                    <span className="upload-hint">Maximum 10 photos au total, 5MB par photo</span>
                                </label>
                            </div>

                            {/* Previews des nouvelles photos */}
                            {photosPreviews.length > 0 && (
                                <div className="modifier-voiture-nouvelles-photos">
                                    <h3 className="modifier-voiture-subsection-title">Nouvelles photos à ajouter</h3>
                                    <div className="modifier-voiture-photo-grid">
                                        {photosPreviews.map((preview, index) => (
                                            <div key={index} className="modifier-voiture-photo-item">
                                                <img src={preview} alt={`Nouvelle photo ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    className="modifier-voiture-photo-remove"
                                                    onClick={() => supprimerNouvellePhoto(index)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="modifier-voiture-actions">
                            <button
                                type="button"
                                className="modifier-voiture-btn modifier-voiture-btn-cancel"
                                onClick={() => navigate(`/mes-voitures/${id}`)}
                                disabled={saving}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="modifier-voiture-btn modifier-voiture-btn-save"
                                disabled={saving}
                            >
                                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModifierMaVoiture;
