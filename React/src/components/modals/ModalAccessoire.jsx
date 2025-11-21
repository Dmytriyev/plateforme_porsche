import { useState, useEffect } from 'react';
import { staffService } from '../../services';
import '../../css/Modal.css';

/**
 * Modal pour ajouter ou modifier un accessoire
 * Avec upload d'images
 */
const ModalAccessoire = ({ accessoire, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nom_accesoire: '',
        type_accesoire: '',
        prix: '',
        description: '',
        stock: '',
        disponibilite: true
    });

    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (accessoire) {
            setFormData({
                nom_accesoire: accessoire.nom_accesoire || '',
                type_accesoire: accessoire.type_accesoire || '',
                prix: accessoire.prix || '',
                description: accessoire.description || '',
                stock: accessoire.stock || '',
                disponibilite: accessoire.disponibilite !== false
            });

            // Prévisualiser les images existantes
            if (accessoire.photo_accesoire && accessoire.photo_accesoire.length > 0) {
                setPreviewUrls(accessoire.photo_accesoire.map(photo => photo.url));
            }
        }
    }, [accessoire]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            setError('Maximum 5 images autorisées');
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

            if (accessoire) {
                // Modification
                await staffService.modifierAccessoire(accessoire._id, data);
            } else {
                // Ajout
                await staffService.ajouterAccessoire(data);
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
                    <h2>{accessoire ? 'Modifier' : 'Ajouter'} un accessoire</h2>
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
                            <label htmlFor="nom_accesoire">Nom de l'accessoire *</label>
                            <input
                                type="text"
                                id="nom_accesoire"
                                name="nom_accesoire"
                                value={formData.nom_accesoire}
                                onChange={handleChange}
                                required
                                placeholder="Ex: Jantes 20 pouces"
                            />
                        </div>

                        <div className="modal-form-group">
                            <label htmlFor="type_accesoire">Type d'accessoire *</label>
                            <select
                                id="type_accesoire"
                                name="type_accesoire"
                                value={formData.type_accesoire}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Sélectionner...</option>
                                <option value="jantes">Jantes</option>
                                <option value="interieur">Intérieur</option>
                                <option value="exterieur">Extérieur</option>
                                <option value="performance">Performance</option>
                                <option value="confort">Confort</option>
                                <option value="technologie">Technologie</option>
                                <option value="autre">Autre</option>
                            </select>
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
                                placeholder="Ex: 1500"
                            />
                        </div>

                        <div className="modal-form-group">
                            <label htmlFor="stock">Stock disponible</label>
                            <input
                                type="number"
                                id="stock"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                min="0"
                                placeholder="Ex: 10"
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
                            placeholder="Décrivez l'accessoire, ses caractéristiques, sa compatibilité..."
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
                            <span>Accessoire disponible</span>
                        </label>
                    </div>

                    {/* Upload d'images */}
                    <div className="modal-form-group">
                        <label>Images (max 5)</label>
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
                            {loading ? 'Enregistrement...' : accessoire ? 'Modifier' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalAccessoire;
