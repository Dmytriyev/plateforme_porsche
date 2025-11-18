/**
 * Composant: ModelPorscheSelector
 * Description: Sélecteur en cascade pour les modèles et variantes Porsche
 * Usage: Permet de sélectionner un modèle (911, Cayman, Cayenne) puis ses variantes
 * API: 
 * - GET /api/voiture/all pour récupérer les modèles
 * - GET /api/model_porsche/variantes/:nomModel pour récupérer les variantes par modèle
 * - GET /api/model_porsche/carrosseries pour récupérer tous les types de carrosserie
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * VERSION SIMPLE - Sélecteur en cascade modèle > variante
 */
const ModelPorscheSelector = ({
    onModelSelect,
    selectedModel = '',
    selectedVariante = ''
}) => {
    const [modeles, setModeles] = useState([]);
    const [variantes, setVariantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchModeles();
    }, []);

    useEffect(() => {
        if (selectedModel) {
            fetchVariantes(selectedModel);
        } else {
            setVariantes([]);
        }
    }, [selectedModel]);

    const fetchModeles = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/voiture/all');
            setModeles(response.data);
            setError(null);
        } catch (err) {
            console.error('Erreur lors du chargement des modèles:', err);
            setError('Impossible de charger les modèles');
        } finally {
            setLoading(false);
        }
    };

    const fetchVariantes = async (nomModel) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/model_porsche/variantes/${nomModel}`);
            if (response.data.success) {
                setVariantes(response.data.data.variantes);
            }
        } catch (err) {
            console.error('Erreur lors du chargement des variantes:', err);
            setError('Impossible de charger les variantes');
        }
    };

    const handleModelChange = (e) => {
        const model = e.target.value;
        if (onModelSelect) {
            onModelSelect({ model, variante: '' });
        }
    };

    const handleVarianteChange = (e) => {
        const variante = e.target.value;
        if (onModelSelect) {
            onModelSelect({ model: selectedModel, variante });
        }
    };

    if (loading) {
        return <div className="model-selector-loading">Chargement des modèles...</div>;
    }

    if (error) {
        return (
            <div className="model-selector-error">
                <p>{error}</p>
                <button onClick={fetchModeles}>Réessayer</button>
            </div>
        );
    }

    return (
        <div className="model-porsche-selector">
            <div className="selector-group">
                <label htmlFor="model-select">Modèle Porsche:</label>
                <select
                    id="model-select"
                    value={selectedModel}
                    onChange={handleModelChange}
                    className="model-select-input"
                >
                    <option value="">-- Choisir un modèle --</option>
                    {modeles.map((modele) => (
                        <option key={modele._id} value={modele.nom_model}>
                            {modele.nom_model}
                        </option>
                    ))}
                </select>
            </div>

            {selectedModel && (
                <div className="selector-group">
                    <label htmlFor="variante-select">Variante:</label>
                    <select
                        id="variante-select"
                        value={selectedVariante}
                        onChange={handleVarianteChange}
                        className="variante-select-input"
                        disabled={!variantes.length}
                    >
                        <option value="">-- Choisir une variante --</option>
                        {variantes.map((variante) => (
                            <option key={variante.value} value={variante.value}>
                                {variante.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

/**
 * VERSION AVANCÉE - Avec carrosserie et affichage des spécifications
 */
const AdvancedModelPorscheSelector = ({
    onConfigurationSelect,
    initialConfiguration = { model: '', variante: '', carrosserie: '' }
}) => {
    const [modeles, setModeles] = useState([]);
    const [variantes, setVariantes] = useState([]);
    const [carrosseries, setCarrosseries] = useState([]);
    const [configurations, setConfigurations] = useState([]);
    const [selectedConfig, setSelectedConfig] = useState(initialConfiguration);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedConfig.model) {
            fetchVariantesAndCarrosseries(selectedConfig.model);
        } else {
            setVariantes([]);
            setCarrosseries([]);
        }
    }, [selectedConfig.model]);

    useEffect(() => {
        if (selectedConfig.model && selectedConfig.variante) {
            fetchConfigurations();
        }
    }, [selectedConfig.model, selectedConfig.variante]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const modelesResponse = await axios.get('http://localhost:5000/api/voiture/all');
            setModeles(modelesResponse.data);
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    const fetchVariantesAndCarrosseries = async (nomModel) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/model_porsche/variantes/${nomModel}`);
            if (response.data.success) {
                setVariantes(response.data.data.variantes);
                setCarrosseries(response.data.data.carrosseries);
            }
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les variantes');
        }
    };

    const fetchConfigurations = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/model_porsche/all');
            const filtered = response.data.filter(config =>
                config.voiture?.nom_model === selectedConfig.model &&
                config.nom_model === selectedConfig.variante
            );
            setConfigurations(filtered);
        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    const handleChange = (field, value) => {
        const newConfig = { ...selectedConfig, [field]: value };

        // Reset des champs dépendants
        if (field === 'model') {
            newConfig.variante = '';
            newConfig.carrosserie = '';
        } else if (field === 'variante') {
            newConfig.carrosserie = '';
        }

        setSelectedConfig(newConfig);
        if (onConfigurationSelect) {
            onConfigurationSelect(newConfig);
        }
    };

    if (loading) {
        return (
            <div className="advanced-model-selector-loading">
                <div className="spinner"></div>
                <p>Chargement...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="advanced-model-selector-error">
                <p className="error-message">{error}</p>
                <button onClick={fetchInitialData} className="retry-button">
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="advanced-model-porsche-selector">
            <h3>Configurez votre Porsche</h3>

            {/* Sélection du modèle */}
            <div className="config-step">
                <label htmlFor="advanced-model-select">
                    <span className="step-number">1</span>
                    Choisissez votre modèle:
                </label>
                <select
                    id="advanced-model-select"
                    value={selectedConfig.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    className="config-select"
                >
                    <option value="">-- Sélectionnez un modèle --</option>
                    {modeles.map((modele) => (
                        <option key={modele._id} value={modele.nom_model}>
                            Porsche {modele.nom_model}
                        </option>
                    ))}
                </select>
                {selectedConfig.model && modeles.find(m => m.nom_model === selectedConfig.model)?.description && (
                    <p className="model-description">
                        {modeles.find(m => m.nom_model === selectedConfig.model).description}
                    </p>
                )}
            </div>

            {/* Sélection de la variante */}
            {selectedConfig.model && (
                <div className="config-step">
                    <label htmlFor="advanced-variante-select">
                        <span className="step-number">2</span>
                        Choisissez votre variante:
                    </label>
                    <div className="variantes-grid">
                        {variantes.map((variante) => (
                            <div
                                key={variante.value}
                                className={`variante-card ${selectedConfig.variante === variante.value ? 'selected' : ''}`}
                                onClick={() => handleChange('variante', variante.value)}
                            >
                                <h4>{variante.label}</h4>
                                <button className="select-button">
                                    {selectedConfig.variante === variante.value ? 'Sélectionné' : 'Sélectionner'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sélection de la carrosserie */}
            {selectedConfig.model && selectedConfig.variante && carrosseries.length > 0 && (
                <div className="config-step">
                    <label htmlFor="advanced-carrosserie-select">
                        <span className="step-number">3</span>
                        Type de carrosserie:
                    </label>
                    <div className="carrosserie-options">
                        {carrosseries.map((carrosserie) => (
                            <label
                                key={carrosserie.value}
                                className={`carrosserie-option ${selectedConfig.carrosserie === carrosserie.value ? 'selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="carrosserie"
                                    value={carrosserie.value}
                                    checked={selectedConfig.carrosserie === carrosserie.value}
                                    onChange={(e) => handleChange('carrosserie', e.target.value)}
                                />
                                <span>{carrosserie.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Affichage des configurations disponibles */}
            {configurations.length > 0 && (
                <div className="configurations-available">
                    <h4>Configurations disponibles:</h4>
                    <div className="configs-list">
                        {configurations.map((config) => (
                            <div key={config._id} className="config-item">
                                <h5>{config.nom_model}</h5>
                                <p className="config-carrosserie">{config.type_carrosserie}</p>
                                {config.specifications && (
                                    <div className="specs-summary">
                                        <span>{config.specifications.puissance} CV</span>
                                        <span>{config.specifications.acceleration_0_100}s (0-100)</span>
                                        <span>{config.specifications.vitesse_max} km/h</span>
                                    </div>
                                )}
                                <p className="config-prix">
                                    À partir de {new Intl.NumberFormat('fr-FR', {
                                        style: 'currency',
                                        currency: 'EUR'
                                    }).format(config.prix_base)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * EXEMPLE D'UTILISATION
 */
const ModelPorscheSelectorExample = () => {
    const [simpleSelection, setSimpleSelection] = useState({ model: '', variante: '' });
    const [advancedSelection, setAdvancedSelection] = useState({
        model: '',
        variante: '',
        carrosserie: ''
    });

    return (
        <div className="example-container">
            <h2>Sélecteur de Modèles Porsche</h2>

            {/* Version Simple */}
            <section className="example-section">
                <h3>Version Simple</h3>
                <ModelPorscheSelector
                    selectedModel={simpleSelection.model}
                    selectedVariante={simpleSelection.variante}
                    onModelSelect={setSimpleSelection}
                />
                {simpleSelection.model && simpleSelection.variante && (
                    <div className="selection-display">
                        <p><strong>Sélection:</strong> Porsche {simpleSelection.model} {simpleSelection.variante}</p>
                    </div>
                )}
            </section>

            {/* Version Avancée */}
            <section className="example-section">
                <h3>Version Avancée avec Carrosserie</h3>
                <AdvancedModelPorscheSelector
                    initialConfiguration={advancedSelection}
                    onConfigurationSelect={setAdvancedSelection}
                />
                {advancedSelection.model && advancedSelection.variante && (
                    <div className="advanced-selection-display">
                        <h4>Configuration sélectionnée:</h4>
                        <ul>
                            <li><strong>Modèle:</strong> {advancedSelection.model}</li>
                            <li><strong>Variante:</strong> {advancedSelection.variante}</li>
                            {advancedSelection.carrosserie && (
                                <li><strong>Carrosserie:</strong> {advancedSelection.carrosserie}</li>
                            )}
                        </ul>
                    </div>
                )}
            </section>
        </div>
    );
};

export default ModelPorscheSelector;
export { AdvancedModelPorscheSelector, ModelPorscheSelectorExample };

/**
 * STYLES CSS RECOMMANDÉS
 * 
 * .model-porsche-selector {
 *   display: flex;
 *   flex-direction: column;
 *   gap: 20px;
 * }
 * 
 * .selector-group {
 *   display: flex;
 *   flex-direction: column;
 *   gap: 8px;
 * }
 * 
 * .config-select {
 *   width: 100%;
 *   padding: 12px;
 *   border: 2px solid #e0e0e0;
 *   border-radius: 4px;
 *   font-size: 16px;
 *   transition: border-color 0.3s;
 * }
 * 
 * .config-select:focus {
 *   border-color: #d5001c;
 *   outline: none;
 * }
 * 
 * .config-step {
 *   margin: 20px 0;
 *   padding: 20px;
 *   background-color: #f9f9f9;
 *   border-radius: 8px;
 * }
 * 
 * .step-number {
 *   display: inline-block;
 *   width: 30px;
 *   height: 30px;
 *   background-color: #d5001c;
 *   color: white;
 *   border-radius: 50%;
 *   text-align: center;
 *   line-height: 30px;
 *   margin-right: 10px;
 *   font-weight: bold;
 * }
 * 
 * .variantes-grid {
 *   display: grid;
 *   grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
 *   gap: 15px;
 *   margin-top: 15px;
 * }
 * 
 * .variante-card {
 *   border: 2px solid #e0e0e0;
 *   border-radius: 8px;
 *   padding: 20px;
 *   cursor: pointer;
 *   transition: all 0.3s ease;
 *   text-align: center;
 * }
 * 
 * .variante-card:hover {
 *   border-color: #d5001c;
 *   box-shadow: 0 4px 12px rgba(213, 0, 28, 0.1);
 * }
 * 
 * .variante-card.selected {
 *   border-color: #d5001c;
 *   background-color: #fff5f5;
 * }
 * 
 * .carrosserie-options {
 *   display: flex;
 *   gap: 15px;
 *   flex-wrap: wrap;
 *   margin-top: 15px;
 * }
 * 
 * .carrosserie-option {
 *   flex: 1;
 *   min-width: 150px;
 *   padding: 15px;
 *   border: 2px solid #e0e0e0;
 *   border-radius: 8px;
 *   cursor: pointer;
 *   transition: all 0.3s ease;
 * }
 * 
 * .carrosserie-option.selected {
 *   border-color: #d5001c;
 *   background-color: #fff5f5;
 * }
 * 
 * .config-item {
 *   border: 1px solid #e0e0e0;
 *   border-radius: 8px;
 *   padding: 15px;
 *   margin: 10px 0;
 * }
 * 
 * .specs-summary {
 *   display: flex;
 *   gap: 15px;
 *   margin: 10px 0;
 *   font-size: 14px;
 *   color: #666;
 * }
 * 
 * .config-prix {
 *   font-size: 18px;
 *   font-weight: bold;
 *   color: #d5001c;
 *   margin-top: 10px;
 * }
 */
