/**
 * Exemple de composant React pour sélectionner un modèle Porsche
 * Ce fichier est fourni comme exemple d'intégration frontend.
 * Placez-le dans votre projet React (ex: src/components/VoitureForm.jsx)
 */

import React, { useState } from 'react';

// Importer les constantes depuis votre API ou définir localement
const PORSCHE_MODELS = ['911', 'Cayman', 'Cayenne'];

const VoitureForm = () => {
    const [formData, setFormData] = useState({
        type_voiture: false,
        nom_model: '',
        description: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Gérer les changements de formulaire
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Effacer l'erreur du champ modifié
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validation côté client
    const validateForm = () => {
        const newErrors = {};

        if (!formData.nom_model) {
            newErrors.nom_model = 'Veuillez sélectionner un modèle';
        } else if (!PORSCHE_MODELS.includes(formData.nom_model)) {
            newErrors.nom_model = `Modèle invalide. Choisissez parmi: ${PORSCHE_MODELS.join(', ')}`;
        }

        if (!formData.description || formData.description.trim().length === 0) {
            newErrors.description = 'La description est requise';
        } else if (formData.description.length > 1000) {
            newErrors.description = 'La description ne peut pas dépasser 1000 caractères';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Soumettre le formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setSuccess(false);

        try {
            const response = await fetch('/api/voiture/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Ajouter votre token d'authentification si nécessaire
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                // Gérer les erreurs du serveur
                if (data.message) {
                    setErrors({ submit: data.message });
                }
                throw new Error(data.message || 'Erreur lors de la création');
            }

            // Succès
            setSuccess(true);
            setFormData({
                type_voiture: false,
                nom_model: '',
                description: ''
            });

            console.log('Voiture créée avec succès:', data);

        } catch (error) {
            console.error('Erreur:', error);
            setErrors({ submit: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="voiture-form-container">
            <h2>Créer une nouvelle gamme de voiture</h2>

            {success && (
                <div className="success-message">
                    ✅ Gamme de voiture créée avec succès !
                </div>
            )}

            <form onSubmit={handleSubmit} className="voiture-form">

                {/* Type de voiture (Neuve/Occasion) */}
                <div className="form-group">
                    <label htmlFor="type_voiture">
                        <input
                            type="checkbox"
                            id="type_voiture"
                            name="type_voiture"
                            checked={formData.type_voiture}
                            onChange={handleChange}
                        />
                        {' '}Voiture neuve (décochez pour occasion)
                    </label>
                </div>

                {/* Sélection du modèle - LISTE PRÉDÉFINIE */}
                <div className="form-group">
                    <label htmlFor="nom_model">
                        Modèle Porsche <span className="required">*</span>
                    </label>
                    <select
                        id="nom_model"
                        name="nom_model"
                        value={formData.nom_model}
                        onChange={handleChange}
                        className={errors.nom_model ? 'error' : ''}
                        required
                    >
                        <option value="">-- Sélectionnez un modèle --</option>
                        {PORSCHE_MODELS.map(model => (
                            <option key={model} value={model}>
                                {model}
                            </option>
                        ))}
                    </select>
                    {errors.nom_model && (
                        <span className="error-message">{errors.nom_model}</span>
                    )}
                </div>

                {/* Description */}
                <div className="form-group">
                    <label htmlFor="description">
                        Description <span className="required">*</span>
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Décrivez les caractéristiques de ce modèle..."
                        rows="5"
                        maxLength="1000"
                        className={errors.description ? 'error' : ''}
                        required
                    />
                    <small className="char-counter">
                        {formData.description.length} / 1000 caractères
                    </small>
                    {errors.description && (
                        <span className="error-message">{errors.description}</span>
                    )}
                </div>

                {/* Erreur générale */}
                {errors.submit && (
                    <div className="error-message submit-error">
                        ❌ {errors.submit}
                    </div>
                )}

                {/* Bouton de soumission */}
                <div className="form-actions">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? 'Création en cours...' : 'Créer la gamme'}
                    </button>
                </div>
            </form>

            <style jsx>{`
        .voiture-form-container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }

        .required {
          color: #d32f2f;
        }

        select, textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          font-family: inherit;
          transition: border-color 0.3s;
        }

        select:focus, textarea:focus {
          outline: none;
          border-color: #d32f2f;
        }

        select.error, textarea.error {
          border-color: #d32f2f;
        }

        .error-message {
          display: block;
          color: #d32f2f;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .success-message {
          background: #4caf50;
          color: white;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
        }

        .char-counter {
          display: block;
          text-align: right;
          color: #666;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .btn {
          padding: 0.75rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #d32f2f;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #b71c1c;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-actions {
          margin-top: 2rem;
          text-align: center;
        }
      `}</style>
        </div>
    );
};

export default VoitureForm;
