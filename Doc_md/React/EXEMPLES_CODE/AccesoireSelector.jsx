/**
 * AccesoireSelector.jsx
 * 
 * Composant React pour sélectionner le type d'accessoire parmi les choix prédéfinis.
 * Version simple et avancée avec affichage des icônes et descriptions.
 * 
 * Utilisation:
 * - Import: import AccesoireSelector from './AccesoireSelector';
 * - Usage simple: <AccesoireSelector value={typeAccesoire} onChange={setTypeAccesoire} />
 * - Usage avancé: <AccesoireSelectorAdvanced value={typeAccesoire} onChange={setTypeAccesoire} showDescription={true} />
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ============================================
// VERSION SIMPLE
// ============================================

/**
 * Composant simple de sélection de type d'accessoire
 * @param {Object} props
 * @param {string} props.value - Type d'accessoire sélectionné
 * @param {Function} props.onChange - Callback lors du changement de sélection
 * @param {boolean} [props.disabled=false] - Désactive le sélecteur
 */
const AccesoireSelector = ({ value, onChange, disabled = false }) => {
    const [typesAccesoire, setTypesAccesoire] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTypesAccesoire = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/api/accesoire/types');

                if (response.data.success && response.data.data) {
                    setTypesAccesoire(response.data.data);
                }
            } catch (err) {
                console.error('Erreur lors du chargement des types d\'accessoires:', err);
                setError('Impossible de charger les types d\'accessoires');
            } finally {
                setLoading(false);
            }
        };

        fetchTypesAccesoire();
    }, []);

    if (loading) {
        return <div className="loading">Chargement des types d'accessoires...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="accesoire-selector">
            <label htmlFor="type-accesoire">Type d'accessoire:</label>
            <select
                id="type-accesoire"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                required
            >
                <option value="">-- Sélectionnez un type --</option>
                {typesAccesoire.map((type) => (
                    <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

// ============================================
// VERSION AVANCÉE
// ============================================

/**
 * Composant avancé de sélection de type d'accessoire avec cartes visuelles
 * @param {Object} props
 * @param {string} props.value - Type d'accessoire sélectionné
 * @param {Function} props.onChange - Callback lors du changement de sélection
 * @param {boolean} [props.showDescription=true] - Affiche les descriptions
 * @param {boolean} [props.disabled=false] - Désactive le sélecteur
 */
const AccesoireSelectorAdvanced = ({
    value,
    onChange,
    showDescription = true,
    disabled = false
}) => {
    const [typesAccesoire, setTypesAccesoire] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTypesAccesoire = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/api/accesoire/types');

                if (response.data.success && response.data.data) {
                    setTypesAccesoire(response.data.data);
                }
            } catch (err) {
                console.error('Erreur lors du chargement des types d\'accessoires:', err);
                setError('Impossible de charger les types d\'accessoires');
            } finally {
                setLoading(false);
            }
        };

        fetchTypesAccesoire();
    }, []);

    if (loading) {
        return (
            <div className="accesoire-selector-advanced loading-container">
                <div className="spinner"></div>
                <p>Chargement des types d'accessoires...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="accesoire-selector-advanced error-container">
                <p className="error-message">❌ {error}</p>
            </div>
        );
    }

    return (
        <div className="accesoire-selector-advanced">
            <h3>Sélectionnez le type d'accessoire</h3>
            <div className="types-grid">
                {typesAccesoire.map((type) => (
                    <div
                        key={type.value}
                        className={`type-card ${value === type.value ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                        onClick={() => !disabled && onChange(type.value)}
                        role="button"
                        tabIndex={disabled ? -1 : 0}
                        onKeyPress={(e) => {
                            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                                onChange(type.value);
                            }
                        }}
                    >
                        <div className="type-icon">{type.icon}</div>
                        <div className="type-label">{type.label}</div>
                        {showDescription && type.description && (
                            <div className="type-description">{type.description}</div>
                        )}
                        {value === type.value && (
                            <div className="selected-badge">✓</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// STYLES CSS (à intégrer dans votre fichier CSS)
// ============================================

const styles = `
/* Version simple */
.accesoire-selector {
  margin: 15px 0;
}

.accesoire-selector label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.accesoire-selector select {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.accesoire-selector select:hover:not(:disabled) {
  border-color: #000;
}

.accesoire-selector select:focus {
  outline: none;
  border-color: #d5001c;
  box-shadow: 0 0 0 3px rgba(213, 0, 28, 0.1);
}

.accesoire-selector select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Version avancée */
.accesoire-selector-advanced {
  margin: 20px 0;
}

.accesoire-selector-advanced h3 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #000;
  font-weight: 700;
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.type-card {
  position: relative;
  padding: 20px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.type-card:hover:not(.disabled) {
  border-color: #000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.type-card.selected {
  border-color: #d5001c;
  background-color: #fff5f6;
  box-shadow: 0 4px 12px rgba(213, 0, 28, 0.2);
}

.type-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.type-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.type-label {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.type-description {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
  line-height: 1.4;
}

.selected-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  background-color: #d5001c;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}

/* Loading et erreur */
.loading-container,
.error-container {
  padding: 40px;
  text-align: center;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #d5001c;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #d5001c;
  font-size: 16px;
}

.loading,
.error {
  padding: 12px;
  text-align: center;
  border-radius: 6px;
}

.loading {
  background-color: #f0f0f0;
  color: #666;
}

.error {
  background-color: #ffe6e6;
  color: #d5001c;
}
`;

// ============================================
// EXEMPLE D'UTILISATION
// ============================================

const ExempleUtilisation = () => {
    const [typeAccesoireSimple, setTypeAccesoireSimple] = useState('');
    const [typeAccesoireAvance, setTypeAccesoireAvance] = useState('');

    return (
        <div className="exemple-container">
            <h2>Exemple d'utilisation des sélecteurs de type d'accessoire</h2>

            {/* Version simple */}
            <div className="exemple-section">
                <h3>Version Simple</h3>
                <AccesoireSelector
                    value={typeAccesoireSimple}
                    onChange={setTypeAccesoireSimple}
                />
                {typeAccesoireSimple && (
                    <p className="selection-info">
                        Type sélectionné: <strong>{typeAccesoireSimple}</strong>
                    </p>
                )}
            </div>

            {/* Version avancée */}
            <div className="exemple-section">
                <h3>Version Avancée</h3>
                <AccesoireSelectorAdvanced
                    value={typeAccesoireAvance}
                    onChange={setTypeAccesoireAvance}
                    showDescription={true}
                />
                {typeAccesoireAvance && (
                    <p className="selection-info">
                        Type sélectionné: <strong>{typeAccesoireAvance}</strong>
                    </p>
                )}
            </div>
        </div>
    );
};

export default AccesoireSelector;
export { AccesoireSelectorAdvanced, ExempleUtilisation };
