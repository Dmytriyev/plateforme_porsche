/**
 * Composant: CouleurExterieurSelector
 * Description: Sélecteur de couleurs extérieures Porsche
 * Usage: Permet aux utilisateurs de choisir une couleur extérieure prédéfinie
 * API: GET /api/couleur_exterieur/couleurs pour récupérer les couleurs disponibles
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * VERSION SIMPLE - Sélecteur basique de couleur extérieure
 */
const CouleurExterieurSelector = ({
    onCouleurSelect,
    selectedCouleur = ''
}) => {
    const [couleurs, setCouleurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCouleurs();
    }, []);

    const fetchCouleurs = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/couleur_exterieur/couleurs');

            if (response.data.success) {
                setCouleurs(response.data.data);
            }
            setError(null);
        } catch (err) {
            console.error('Erreur lors du chargement des couleurs:', err);
            setError('Impossible de charger les couleurs extérieures');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const couleur = e.target.value;
        if (onCouleurSelect) {
            onCouleurSelect(couleur);
        }
    };

    if (loading) {
        return <div className="couleur-selector-loading">Chargement des couleurs...</div>;
    }

    if (error) {
        return (
            <div className="couleur-selector-error">
                <p>{error}</p>
                <button onClick={fetchCouleurs}>Réessayer</button>
            </div>
        );
    }

    return (
        <div className="couleur-exterieur-selector">
            <label htmlFor="couleur-exterieur-select">
                Couleur extérieure:
            </label>
            <select
                id="couleur-exterieur-select"
                value={selectedCouleur}
                onChange={handleChange}
                className="couleur-select-input"
            >
                <option value="">-- Choisir une couleur --</option>
                {couleurs.map((couleur) => (
                    <option key={couleur.value} value={couleur.value}>
                        {couleur.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

/**
 * VERSION AVANCÉE - Sélecteur avec aperçu visuel des couleurs
 */
const AdvancedCouleurExterieurSelector = ({
    onCouleurSelect,
    selectedCouleur = '',
    showPrice = false
}) => {
    const [couleurs, setCouleurs] = useState([]);
    const [couleursData, setCouleursData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Codes couleurs pour l'aperçu visuel
    const couleurCodes = {
        'black': '#000000',
        'red': '#D5001C',
        'white': '#FFFFFF',
        'bleu': '#0066CC',
        'green': '#00563B',
        'yellow': '#FFD700',
        'gray': '#6E7073'
    };

    const couleurDescriptions = {
        'black': 'Noir profond - élégance classique Porsche',
        'red': 'Rouge Carmin - passion sportive',
        'white': 'Blanc pur - raffinement contemporain',
        'bleu': 'Bleu Gentiane - tradition racing',
        'green': 'Vert British Racing - héritage compétition',
        'yellow': 'Jaune Racing - audace et performance',
        'gray': 'Gris Agate - sophistication moderne'
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Récupérer les couleurs disponibles
            const couleursResponse = await axios.get('http://localhost:5000/api/couleur_exterieur/couleurs');
            if (couleursResponse.data.success) {
                setCouleurs(couleursResponse.data.data);
            }

            // Si on veut afficher les prix, récupérer toutes les couleurs avec détails
            if (showPrice) {
                const allCouleursResponse = await axios.get('http://localhost:5000/api/couleur_exterieur/all');
                setCouleursData(allCouleursResponse.data);
            }

            setError(null);
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            setError('Impossible de charger les couleurs');
        } finally {
            setLoading(false);
        }
    };

    const handleCouleurClick = (couleurValue) => {
        if (onCouleurSelect) {
            onCouleurSelect(couleurValue);
        }
    };

    const getCouleurInfo = (couleurValue) => {
        if (!showPrice) return null;
        return couleursData.find(c => c.nom_couleur === couleurValue);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    if (loading) {
        return (
            <div className="advanced-couleur-selector-loading">
                <div className="spinner"></div>
                <p>Chargement des couleurs extérieures...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="advanced-couleur-selector-error">
                <p className="error-message">{error}</p>
                <button onClick={fetchData} className="retry-button">
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="advanced-couleur-exterieur-selector">
            <h3>Choisissez la couleur extérieure</h3>

            <div className="couleurs-grid">
                {couleurs.map((couleur) => {
                    const couleurInfo = getCouleurInfo(couleur.value);
                    const isSelected = selectedCouleur === couleur.value;
                    const couleurCode = couleurCodes[couleur.value] || '#CCCCCC';
                    const needsBorder = couleur.value === 'white' || couleur.value === 'yellow';

                    return (
                        <div
                            key={couleur.value}
                            className={`couleur-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleCouleurClick(couleur.value)}
                        >
                            <div className="couleur-preview-container">
                                <div
                                    className={`couleur-preview ${needsBorder ? 'with-border' : ''}`}
                                    style={{ backgroundColor: couleurCode }}
                                >
                                    {isSelected && (
                                        <span className="check-mark" style={{
                                            color: couleur.value === 'white' || couleur.value === 'yellow' ? '#000' : '#FFF'
                                        }}>
                                            ✓
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="couleur-info">
                                <h4>{couleur.label}</h4>
                                <p className="couleur-description">
                                    {couleurDescriptions[couleur.value]}
                                </p>

                                {showPrice && couleurInfo && (
                                    <p className="couleur-price">
                                        {couleurInfo.prix > 0
                                            ? `+ ${formatPrice(couleurInfo.prix)}`
                                            : 'Inclus'
                                        }
                                    </p>
                                )}
                            </div>

                            <button className="select-button">
                                {isSelected ? 'Sélectionné' : 'Sélectionner'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {selectedCouleur && (
                <div className="selection-summary">
                    <p>
                        <strong>Couleur sélectionnée:</strong> {
                            couleurs.find(c => c.value === selectedCouleur)?.label
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

/**
 * EXEMPLE D'UTILISATION
 */
const CouleurExterieurSelectorExample = () => {
    const [simpleCouleur, setSimpleCouleur] = useState('');
    const [advancedCouleur, setAdvancedCouleur] = useState('');

    return (
        <div className="example-container">
            <h2>Sélecteur de Couleurs Extérieures Porsche</h2>

            {/* Version Simple */}
            <section className="example-section">
                <h3>Version Simple</h3>
                <CouleurExterieurSelector
                    selectedCouleur={simpleCouleur}
                    onCouleurSelect={setSimpleCouleur}
                />
                {simpleCouleur && (
                    <div className="selection-display">
                        <p><strong>Sélection:</strong> {simpleCouleur}</p>
                    </div>
                )}
            </section>

            {/* Version Avancée */}
            <section className="example-section">
                <h3>Version Avancée avec Aperçu Visuel</h3>
                <AdvancedCouleurExterieurSelector
                    selectedCouleur={advancedCouleur}
                    onCouleurSelect={setAdvancedCouleur}
                    showPrice={true}
                />
            </section>
        </div>
    );
};

export default CouleurExterieurSelector;
export { AdvancedCouleurExterieurSelector, CouleurExterieurSelectorExample };

/**
 * STYLES CSS RECOMMANDÉS
 * 
 * .couleur-exterieur-selector {
 *   margin: 20px 0;
 * }
 * 
 * .couleur-select-input {
 *   width: 100%;
 *   padding: 12px;
 *   border: 2px solid #e0e0e0;
 *   border-radius: 4px;
 *   font-size: 16px;
 * }
 * 
 * .couleurs-grid {
 *   display: grid;
 *   grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
 *   gap: 20px;
 *   margin-top: 20px;
 * }
 * 
 * .couleur-card {
 *   border: 3px solid #e0e0e0;
 *   border-radius: 12px;
 *   padding: 20px;
 *   cursor: pointer;
 *   transition: all 0.3s ease;
 *   background-color: white;
 * }
 * 
 * .couleur-card:hover {
 *   border-color: #d5001c;
 *   box-shadow: 0 6px 16px rgba(213, 0, 28, 0.15);
 *   transform: translateY(-2px);
 * }
 * 
 * .couleur-card.selected {
 *   border-color: #d5001c;
 *   background-color: #fff5f5;
 *   box-shadow: 0 6px 16px rgba(213, 0, 28, 0.2);
 * }
 * 
 * .couleur-preview-container {
 *   display: flex;
 *   justify-content: center;
 *   margin-bottom: 15px;
 * }
 * 
 * .couleur-preview {
 *   width: 80px;
 *   height: 80px;
 *   border-radius: 50%;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   position: relative;
 *   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
 *   transition: transform 0.3s ease;
 * }
 * 
 * .couleur-preview.with-border {
 *   border: 2px solid #e0e0e0;
 * }
 * 
 * .couleur-card:hover .couleur-preview {
 *   transform: scale(1.1);
 * }
 * 
 * .check-mark {
 *   font-size: 32px;
 *   font-weight: bold;
 *   text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
 * }
 * 
 * .couleur-info {
 *   text-align: center;
 *   margin-bottom: 15px;
 * }
 * 
 * .couleur-info h4 {
 *   margin: 0 0 8px 0;
 *   font-size: 18px;
 *   color: #333;
 * }
 * 
 * .couleur-description {
 *   font-size: 13px;
 *   color: #666;
 *   margin: 8px 0;
 *   line-height: 1.4;
 *   min-height: 40px;
 * }
 * 
 * .couleur-price {
 *   font-size: 16px;
 *   font-weight: bold;
 *   color: #d5001c;
 *   margin: 8px 0;
 * }
 * 
 * .select-button {
 *   width: 100%;
 *   background-color: #d5001c;
 *   color: white;
 *   border: none;
 *   padding: 12px;
 *   border-radius: 6px;
 *   cursor: pointer;
 *   font-size: 16px;
 *   font-weight: bold;
 *   transition: background-color 0.3s;
 * }
 * 
 * .select-button:hover {
 *   background-color: #b30017;
 * }
 * 
 * .couleur-card.selected .select-button {
 *   background-color: #333;
 * }
 * 
 * .selection-summary {
 *   margin-top: 20px;
 *   padding: 15px;
 *   background-color: #f5f5f5;
 *   border-radius: 8px;
 *   text-align: center;
 * }
 * 
 * .spinner {
 *   border: 4px solid #f3f3f3;
 *   border-top: 4px solid #d5001c;
 *   border-radius: 50%;
 *   width: 40px;
 *   height: 40px;
 *   animation: spin 1s linear infinite;
 *   margin: 0 auto 10px;
 * }
 * 
 * @keyframes spin {
 *   0% { transform: rotate(0deg); }
 *   100% { transform: rotate(360deg); }
 * }
 */
