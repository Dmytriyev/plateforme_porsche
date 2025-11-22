import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { accesoireService } from '../services';
import { Loading } from '../components/common';
import buildUrl from '../utils/buildUrl';
import '../css/ModifierAccessoire.css';

const ModifierAccessoire = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Options
    const [couleurs, setCouleurs] = useState([]);
    const [typesDisponibles] = useState([
        'porte-clés',
        'vetement',
        'decoration',
        'life-style'
    ]);

    // Photos
    const [photosExistantes, setPhotosExistantes] = useState([]);
    const [photosASupprimer, setPhotosASupprimer] = useState([]);
    const [nouvellesPhotos, setNouvellesPhotos] = useState([]);
    const [photosPreviews, setPhotosPreviews] = useState([]);

    // Formulaire
    const [formData, setFormData] = useState({
        nom_accesoire: '',
        description: '',
        type_accesoire: '',
        prix: '',
        prix_promotion: '',
        stock: '',
        couleur_accesoire: ''
    });

    useEffect(() => {
        if (id) {
            fetchAccessoire();
        }
    }, [id]);

    const fetchAccessoire = async () => {
        try {
            setLoadingData(true);

            const [accessoireData, couleursData] = await Promise.all([
                accesoireService.getAccessoireById(id),
                accesoireService.getCouleurs()
            ]);

            setCouleurs(Array.isArray(couleursData) ? couleursData : []);

            // Charger les photos existantes
            if (Array.isArray(accessoireData.photo_accesoire)) {
                setPhotosExistantes(accessoireData.photo_accesoire);
            }

            // Pré-remplir le formulaire
            setFormData({
                nom_accesoire: accessoireData.nom_accesoire || '',
                description: accessoireData.description || '',
                type_accesoire: accessoireData.type_accesoire || '',
                prix: accessoireData.prix || '',
                prix_promotion: accessoireData.prix_promotion || '',
                stock: accessoireData.stock || 0,
                disponible: accessoireData.disponible !== false,
                couleur_accesoire: accessoireData.couleur_accesoire?._id || ''
            });

        } catch (err) {
            setError(err.message || 'Erreur lors du chargement de l\'accessoire');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const supprimerPhotoExistante = (photoId) => {
        setPhotosASupprimer(prev => [...prev, photoId]);
    };

    const annulerSuppressionPhoto = (photoId) => {
        setPhotosASupprimer(prev => prev.filter(id => id !== photoId));
    };

    const handleNouvellesPhotos = (e) => {
        const files = Array.from(e.target.files);

        const totalPhotos = photosExistantes.length - photosASupprimer.length + nouvellesPhotos.length + files.length;
        if (totalPhotos > 10) {
            setError('Maximum 10 photos autorisées au total');
            setTimeout(() => setError(''), 3000);
            return;
        }

        const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
        if (invalidFiles.length > 0) {
            setError('Chaque photo doit faire moins de 5MB');
            setTimeout(() => setError(''), 3000);
            return;
        }

        setNouvellesPhotos(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotosPreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });

        e.target.value = '';
    };

    const supprimerNouvellePhoto = (index) => {
        setNouvellesPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotosPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!formData.nom_accesoire || !formData.description || !formData.type_accesoire || !formData.prix) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (formData.prix <= 0) {
            setError('Le prix doit être supérieur à 0');
            return;
        }

        if (formData.prix_promotion && parseFloat(formData.prix_promotion) >= parseFloat(formData.prix)) {
            setError('Le prix promotionnel doit être inférieur au prix normal');
            return;
        }

        try {
            setLoading(true);

            // Préparer les données
            const dataToSend = {
                nom_accesoire: formData.nom_accesoire.trim(),
                description: formData.description.trim(),
                type_accesoire: formData.type_accesoire,
                prix: parseFloat(formData.prix),
                stock: parseInt(formData.stock) || 0
            };

            if (formData.prix_promotion) {
                dataToSend.prix_promotion = parseFloat(formData.prix_promotion);
            }
            if (formData.couleur_accesoire) {
                dataToSend.couleur_accesoire = formData.couleur_accesoire;
            }

            // Mettre à jour l'accessoire
            await accesoireService.updateAccessoire(id, dataToSend);

            // Supprimer les photos marquées
            if (photosASupprimer.length > 0) {
                await accesoireService.removeImages(id, photosASupprimer);
            }

            // Ajouter les nouvelles photos
            if (nouvellesPhotos.length > 0) {
                const formDataPhotos = new FormData();
                nouvellesPhotos.forEach(photo => {
                    formDataPhotos.append('photos', photo);
                });

                await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/accesoire/addImage/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formDataPhotos
                });
            }

            setSuccess('Accessoire modifié avec succès !');
            setTimeout(() => {
                navigate('/accessoires');
            }, 2000);

        } catch (err) {
            setError(err.message || 'Erreur lors de la modification');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return <Loading fullScreen message="Chargement de l'accessoire..." />;
    }

    return (
        <div className="modifier-accessoire-container">
            <div className="modifier-accessoire-header">
                <button
                    className="modifier-accessoire-back"
                    onClick={() => navigate('/accessoires')}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16L6 10L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Retour
                </button>
                <h1 className="modifier-accessoire-title">Modifier l'accessoire</h1>
                <p className="modifier-accessoire-subtitle">Modifiez les informations de l'accessoire</p>
            </div>

            {error && (
                <div className="modifier-accessoire-message modifier-accessoire-message-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="modifier-accessoire-message modifier-accessoire-message-success">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="modifier-accessoire-form">
                {/* Section: Informations de base */}
                <div className="modifier-accessoire-section">
                    <h2 className="modifier-accessoire-section-title">Informations de base</h2>

                    <div className="modifier-accessoire-row">
                        <div className="modifier-accessoire-field">
                            <label className="modifier-accessoire-label">
                                Nom de l'accessoire <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                name="nom_accesoire"
                                value={formData.nom_accesoire}
                                onChange={handleChange}
                                className="modifier-accessoire-input"
                                required
                            />
                        </div>

                        <div className="modifier-accessoire-field">
                            <label className="modifier-accessoire-label">
                                Type d'accessoire <span className="required">*</span>
                            </label>
                            <select
                                name="type_accesoire"
                                value={formData.type_accesoire}
                                onChange={handleChange}
                                className="modifier-accessoire-select"
                                required
                            >
                                <option value="">Sélectionner un type</option>
                                {typesDisponibles.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="modifier-accessoire-field">
                        <label className="modifier-accessoire-label">
                            Description <span className="required">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="modifier-accessoire-textarea"
                            rows="4"
                            required
                        />
                    </div>
                </div>

                {/* Section: Prix et stock */}
                <div className="modifier-accessoire-section">
                    <h2 className="modifier-accessoire-section-title">Prix et disponibilité</h2>

                    <div className="modifier-accessoire-row">
                        <div className="modifier-accessoire-field">
                            <label className="modifier-accessoire-label">
                                Prix (€) <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                name="prix"
                                value={formData.prix}
                                onChange={handleChange}
                                className="modifier-accessoire-input"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div className="modifier-accessoire-field">
                            <label className="modifier-accessoire-label">
                                Prix promotionnel (€)
                            </label>
                            <input
                                type="number"
                                name="prix_promotion"
                                value={formData.prix_promotion}
                                onChange={handleChange}
                                className="modifier-accessoire-input"
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="modifier-accessoire-field">
                        <label className="modifier-accessoire-label">
                            Stock
                        </label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            className="modifier-accessoire-input"
                            min="0"
                        />
                    </div>
                </div>

                {/* Section: Personnalisation */}
                <div className="modifier-accessoire-section">
                    <h2 className="modifier-accessoire-section-title">Personnalisation</h2>

                    <div className="modifier-accessoire-field">
                        <label className="modifier-accessoire-label">
                            Couleur
                        </label>
                        <select
                            name="couleur_accesoire"
                            value={formData.couleur_accesoire}
                            onChange={handleChange}
                            className="modifier-accessoire-select"
                        >
                            <option value="">Aucune couleur spécifique</option>
                            {couleurs.map(couleur => (
                                <option key={couleur._id} value={couleur._id}>
                                    {couleur.nom_couleur}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Section: Photos existantes */}
                {photosExistantes.length > 0 && (
                    <div className="modifier-accessoire-section">
                        <h2 className="modifier-accessoire-section-title">Photos existantes</h2>
                        <div className="modifier-accessoire-photos-grid">
                            {photosExistantes.map((photo) => {
                                const isMarkedForDeletion = photosASupprimer.includes(photo._id);
                                return (
                                    <div
                                        key={photo._id}
                                        className={`modifier-accessoire-photo-item ${isMarkedForDeletion ? 'marked-delete' : ''}`}
                                    >
                                        <img
                                            src={buildUrl(photo.name)}
                                            alt={photo.alt || 'Photo accessoire'}
                                        />
                                        {isMarkedForDeletion ? (
                                            <button
                                                type="button"
                                                onClick={() => annulerSuppressionPhoto(photo._id)}
                                                className="modifier-accessoire-photo-restore"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                    <path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                Annuler
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => supprimerPhotoExistante(photo._id)}
                                                className="modifier-accessoire-photo-delete"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                    <path d="M6 6L14 14M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Section: Nouvelles photos */}
                <div className="modifier-accessoire-section">
                    <h2 className="modifier-accessoire-section-title">Ajouter de nouvelles photos</h2>

                    <div className="modifier-accessoire-upload-area">
                        <input
                            type="file"
                            id="nouvelles-photos"
                            accept="image/*"
                            multiple
                            onChange={handleNouvellesPhotos}
                            className="modifier-accessoire-upload-input"
                        />
                        <label htmlFor="nouvelles-photos" className="modifier-accessoire-upload-label">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Ajouter des photos</span>
                            <span className="modifier-accessoire-upload-hint">
                                PNG, JPG jusqu'à 5MB (max 10 photos au total)
                            </span>
                        </label>
                    </div>

                    {photosPreviews.length > 0 && (
                        <div className="modifier-accessoire-photos-grid">
                            {photosPreviews.map((preview, index) => (
                                <div key={index} className="modifier-accessoire-photo-item">
                                    <img src={preview} alt={`Nouvelle photo ${index + 1}`} />
                                    <button
                                        type="button"
                                        onClick={() => supprimerNouvellePhoto(index)}
                                        className="modifier-accessoire-photo-delete"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M6 6L14 14M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Boutons d'action */}
                <div className="modifier-accessoire-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/accessoires')}
                        className="modifier-accessoire-btn modifier-accessoire-btn-cancel"
                        disabled={loading}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="modifier-accessoire-btn modifier-accessoire-btn-submit"
                        disabled={loading}
                    >
                        {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ModifierAccessoire;
