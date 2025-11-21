import { useState, useEffect } from 'react';
import { staffService } from '../../services';
import '../../css/Modal.css';

/**
 * Modal pour ajouter ou modifier une voiture d'occasion
 * Avec upload d'images
 */
const ModalVoiture = ({ voiture, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nom_model: '',
        type_carrosserie: '',
        kilometrage: '',
        annee: '',
        prix: '',
        couleur_exterieur: '',
        couleur_interieur: '',
        transmission: 'automatique',
        carburant: 'essence',
        description: '',
        disponibilite: true
    });

    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (voiture) {
            setFormData({
                nom_model: voiture.nom_model || '',
                type_carrosserie: voiture.type_carrosserie || '',
                kilometrage: voiture.kilometrage || '',
                annee: voiture.annee || '',
                prix: voiture.prix || '',
                couleur_exterieur: voiture.couleur_exterieur || '',
                couleur_interieur: voiture.couleur_interieur || '',
                transmission: voiture.transmission || 'automatique',
                carburant: voiture.carburant || 'essence',
                description: voiture.description || '',
                disponibilite: voiture.disponibilite !== false
            });

            // Prévisualiser les images existantes
            if (voiture.photo_porsche && voiture.photo_porsche.length > 0) {
                setPreviewUrls(voiture.photo_porsche.map(photo => photo.url));
            }
        }
    }, [voiture]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 10) {
            setError('Maximum 10 images autorisées');
            return;
        }

        setImages(prev => [...prev, ...files]);

        // Créer des URLs de prévisualisation
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrls(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Créer FormData pour l'upload
            const data = new FormData();

            // Ajouter les champs de texte
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            // Ajouter les images
            images.forEach(image => {
                data.append('images', image);
            });

            if (voiture) {
                // Modification
                await staffService.modifierVoitureOccasion(voiture._id, data);
            } else {
                // Ajout
                await staffService.ajouterVoitureOccasion(data);
            }

            onSuccess();
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{voiture ? 'Modifier' : 'Ajouter'} une voiture d'occasion</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && (
                        <div className="modal-error">
                            {error}
                        </div>
                    )}

                    <div className="modal-form-grid">
                        <div className="modal-form-group">
                            <label htmlFor="nom_model">Nom du modèle *</label>
                            <input
                                type="text"
                                id="nom_model"
                                name="nom_model"
                                value={formData.nom_model}
                                onChange={handleChange}
                                required
                                placeholder="Ex: 911 Carrera S"
                            />
                        </div>

                        <div className="modal-form-group">
                            <label htmlFor="type_carrosserie">Type de carrosserie *</label>
                            <select
                                id="type_carrosserie"
                                name="type_carrosserie"
                                value={formData.type_carrosserie}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Sélectionner...</option>
                                <option value="coupé">Coupé</option>
                                <option value="cabriolet">Cabriolet</option>
                                <option value="berline">Berline</option>
                                <option value="SUV">SUV</option>
                                <option value="sport">Sport</option>
                            </select>
                        </div>

                        <div className="modal-form-group">
                            <label htmlFor="kilometrage">Kilométrage *</label>
                            <input
                                type="number"
                                id="kilometrage"
                                name="kilometrage"
                                value={formData.kilometrage}
                                onChange={handleChange}
                                required
                                min="0"
                                placeholder="Ex: 45000"
                            />
                        </div>

                        <div className="modal-form-group">
                            <label htmlFor="annee">Année *</label>
                            <input
                                type="number"
                                id="annee"
                                name="annee"
                                value={formData.annee}
                                onChange={handleChange}
                                required
                                min="1900"
                                max={new Date().getFullYear()}
                                placeholder="Ex: 2020"
                            />
                        </div>

                        <div className="modal-form-group">
                            <label htmlFor="prix">Prix (€) *</label>
                            <input
                                type="number"
                                id="prix"
                                name="prix"
                                value={formData.prix}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                placeholder="Ex: 85000"
                            />
                        </div>

                        <div className="modal-form-group">
                            <label htmlFor="transmission">Transmission *</label>
                            <select
                                id="transmission"
                                name="transmission"
                                value={formData.transmission}
                                onChange={handleChange}
                                required
                            >
                                <option value="automatique">Automatique</option>
                                <option value="manuelle">Manuelle</option>
                            </select>
                        </div>

                        <div className="modal-form-group">
                            <label htmlFor="carburant">Carburant *</label>
                            <select
                                id="carburant"
                                name="carburant"
                                value={formData.carburant}
                                onChange={handleChange}
                                required
                            >
                                <option value="essence">Essence</option>
                                <option value="diesel">Diesel</option>
                                <option value="hybride">Hybride</option>
                                <option value="electrique">Électrique</option>
                            </select>
                        </div>

                        <div className="modal-form-group">
                            <label htmlFor="couleur_exterieur">Couleur extérieure</label>
                            <input
                                type="text"
                                id="couleur_exterieur"
                                name="couleur_exterieur"
                                value={formData.couleur_exterieur}
                                onChange={handleChange}
                                placeholder="Ex: Noir"
                            />
                        </div>

                        <div className="modal-form-group">
                            <label htmlFor="couleur_interieur">Couleur intérieure</label>
                            <input
                                type="text"
                                id="couleur_interieur"
                                name="couleur_interieur"
                                value={formData.couleur_interieur}
                                onChange={handleChange}
                                placeholder="Ex: Cuir noir"
                            />
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Décrivez l'état du véhicule, les options, l'historique..."
                        />
                    </div>

                    <div className="modal-form-group">
                        <label className="modal-checkbox-label">
                            <input
                                type="checkbox"
                                name="disponibilite"
                                checked={formData.disponibilite}
                                onChange={handleChange}
                            />
                            <span>Voiture disponible</span>
                        </label>
                    </div>

                    {/* Upload d'images */}
                    <div className="modal-form-group">
                        <label>Images (max 10)</label>
                        <div className="modal-file-upload">
                            <input
                                type="file"
                                id="images"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="modal-file-input"
                            />
                            <label htmlFor="images" className="modal-file-label">
                                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                                Choisir des images
                            </label>
                        </div>

                        {previewUrls.length > 0 && (
                            <div className="modal-image-preview-grid">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="modal-image-preview">
                                        <img src={url} alt={`Preview ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="modal-image-remove"
                                            onClick={() => handleRemoveImage(index)}
                                        >
                                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="modal-btn modal-btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="modal-btn modal-btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Enregistrement...' : voiture ? 'Modifier' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalVoiture;
