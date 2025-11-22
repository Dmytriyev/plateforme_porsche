import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accesoireService } from '../services';
import { Loading } from '../components/common';
import '../css/AjouterAccessoire.css';

const AjouterAccessoire = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loadingOptions, setLoadingOptions] = useState(true);

    // Options
    const [couleurs, setCouleurs] = useState([]);
    const [typesDisponibles] = useState([
        'porte-clés',
        'vetement',
        'decoration',
        'life-style'
    ]);

    // Photos
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);

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
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            setLoadingOptions(true);
            const couleursData = await accesoireService.getCouleurs();
            setCouleurs(Array.isArray(couleursData) ? couleursData : []);
        } catch (err) {
            console.error('Erreur lors du chargement des options:', err);
            setCouleurs([]);
        } finally {
            setLoadingOptions(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);

        // Validation: max 10 photos
        if (photos.length + files.length > 10) {
            setError('Maximum 10 photos autorisées');
            setTimeout(() => setError(''), 3000);
            return;
        }

        // Validation: taille max 5MB par fichier
        const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
        if (invalidFiles.length > 0) {
            setError('Chaque photo doit faire moins de 5MB');
            setTimeout(() => setError(''), 3000);
            return;
        }

        // Ajouter les photos
        setPhotos(prev => [...prev, ...files]);

        // Créer les previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });

        e.target.value = '';
    };

    const supprimerPhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
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

        if (formData.stock < 0) {
            setError('Le stock ne peut pas être négatif');
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

            // Ajouter les champs optionnels
            if (formData.prix_promotion) {
                dataToSend.prix_promotion = parseFloat(formData.prix_promotion);
            }
            if (formData.couleur_accesoire) {
                dataToSend.couleur_accesoire = formData.couleur_accesoire;
            }

            // Créer l'accessoire
            const nouvelAccessoire = await accesoireService.createAccessoire(dataToSend);

            // Upload des photos si présentes
            if (photos.length > 0 && nouvelAccessoire._id) {
                const formDataPhotos = new FormData();
                photos.forEach(photo => {
                    formDataPhotos.append('photos', photo);
                });

                try {
                    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/accesoire/addImage/${nouvelAccessoire._id}`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: formDataPhotos
                    });
                } catch (photoErr) {
                    console.error('Erreur upload photos:', photoErr);
                }
            }

            setSuccess('Accessoire créé avec succès !');
            setTimeout(() => {
                navigate('/accessoires');
            }, 2000);

        } catch (err) {
            setError(err.message || 'Erreur lors de la création de l\'accessoire');
        } finally {
            setLoading(false);
        }
    };

    if (loadingOptions) {
        return <Loading fullScreen message="Chargement des options..." />;
    }

    return (
        <div className="ajouter-accessoire-container">
            <div className="ajouter-accessoire-header">
                <button
                    className="ajouter-accessoire-back"
                    onClick={() => navigate('/accessoires')}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16L6 10L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Retour
                </button>
                <h1 className="ajouter-accessoire-title">Ajouter un accessoire</h1>
                <p className="ajouter-accessoire-subtitle">Créez un nouvel accessoire Porsche</p>
            </div>

            {error && (
                <div className="ajouter-accessoire-message ajouter-accessoire-message-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="ajouter-accessoire-message ajouter-accessoire-message-success">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="ajouter-accessoire-form">
                {/* Section: Informations de base */}
                <div className="ajouter-accessoire-section">
                    <h2 className="ajouter-accessoire-section-title">Informations de base</h2>

                    <div className="ajouter-accessoire-row">
                        <div className="ajouter-accessoire-field">
                            <label className="ajouter-accessoire-label">
                                Nom de l'accessoire <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                name="nom_accesoire"
                                value={formData.nom_accesoire}
                                onChange={handleChange}
                                className="ajouter-accessoire-input"
                                placeholder="Ex: Porte-clés Porsche Crest"
                                required
                            />
                        </div>

                        <div className="ajouter-accessoire-field">
                            <label className="ajouter-accessoire-label">
                                Type d'accessoire <span className="required">*</span>
                            </label>
                            <select
                                name="type_accesoire"
                                value={formData.type_accesoire}
                                onChange={handleChange}
                                className="ajouter-accessoire-select"
                                required
                            >
                                <option value="">Sélectionner un type</option>
                                {typesDisponibles.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="ajouter-accessoire-field">
                        <label className="ajouter-accessoire-label">
                            Description <span className="required">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="ajouter-accessoire-textarea"
                            rows="4"
                            placeholder="Description détaillée de l'accessoire..."
                            required
                        />
                    </div>
                </div>

                {/* Section: Prix et stock */}
                <div className="ajouter-accessoire-section">
                    <h2 className="ajouter-accessoire-section-title">Prix et disponibilité</h2>

                    <div className="ajouter-accessoire-row">
                        <div className="ajouter-accessoire-field">
                            <label className="ajouter-accessoire-label">
                                Prix (€) <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                name="prix"
                                value={formData.prix}
                                onChange={handleChange}
                                className="ajouter-accessoire-input"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div className="ajouter-accessoire-field">
                            <label className="ajouter-accessoire-label">
                                Prix promotionnel (€)
                            </label>
                            <input
                                type="number"
                                name="prix_promotion"
                                value={formData.prix_promotion}
                                onChange={handleChange}
                                className="ajouter-accessoire-input"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="ajouter-accessoire-field">
                        <label className="ajouter-accessoire-label">
                            Stock
                        </label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            className="ajouter-accessoire-input"
                            placeholder="0"
                            min="0"
                        />
                    </div>
                </div>

                {/* Section: Personnalisation */}
                <div className="ajouter-accessoire-section">
                    <h2 className="ajouter-accessoire-section-title">Personnalisation</h2>

                    <div className="ajouter-accessoire-field">
                        <label className="ajouter-accessoire-label">
                            Couleur
                        </label>
                        <select
                            name="couleur_accesoire"
                            value={formData.couleur_accesoire}
                            onChange={handleChange}
                            className="ajouter-accessoire-select"
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

                {/* Section: Photos */}
                <div className="ajouter-accessoire-section">
                    <h2 className="ajouter-accessoire-section-title">Photos (max 10)</h2>

                    <div className="ajouter-accessoire-upload-area">
                        <input
                            type="file"
                            id="photo-upload"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoChange}
                            className="ajouter-accessoire-upload-input"
                        />
                        <label htmlFor="photo-upload" className="ajouter-accessoire-upload-label">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Cliquez pour ajouter des photos</span>
                            <span className="ajouter-accessoire-upload-hint">
                                PNG, JPG jusqu'à 5MB (max 10 photos)
                            </span>
                        </label>
                    </div>

                    {photoPreviews.length > 0 && (
                        <div className="ajouter-accessoire-photos-grid">
                            {photoPreviews.map((preview, index) => (
                                <div key={index} className="ajouter-accessoire-photo-item">
                                    <img src={preview} alt={`Aperçu ${index + 1}`} />
                                    <button
                                        type="button"
                                        onClick={() => supprimerPhoto(index)}
                                        className="ajouter-accessoire-photo-delete"
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
                <div className="ajouter-accessoire-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/accessoires')}
                        className="ajouter-accessoire-btn ajouter-accessoire-btn-cancel"
                        disabled={loading}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="ajouter-accessoire-btn ajouter-accessoire-btn-submit"
                        disabled={loading}
                    >
                        {loading ? 'Création en cours...' : 'Créer l\'accessoire'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AjouterAccessoire;
