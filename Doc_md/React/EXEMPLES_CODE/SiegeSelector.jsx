/**
 * Composant React pour sélectionner un type de siège
 * Utilise l'API pour récupérer les types disponibles
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SiegeSelector = ({ onSiegeSelected, currentSiege }) => {
    const [types, setTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(currentSiege || '');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Récupérer les types disponibles
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await axios.get('/api/siege/types');
                setTypes(response.data);
            } catch (err) {
                console.error('Erreur lors de la récupération des types:', err);
                setError('Impossible de charger les types de sièges');
            } finally {
                setLoading(false);
            }
        };

        fetchTypes();
    }, []);

    // Notifier le parent quand la sélection change
    useEffect(() => {
        if (selectedType && onSiegeSelected) {
            onSiegeSelected(selectedType);
        }
    }, [selectedType, onSiegeSelected]);

    if (loading) {
        return <div className="siege-selector-loading">Chargement des types de sièges...</div>;
    }

    if (error) {
        return <div className="siege-selector-error">{error}</div>;
    }

    return (
        <div className="siege-selector">
            <h3>Type de siège</h3>

            <div className="form-group">
                <label htmlFor="type-siege">Sélectionnez votre siège:</label>
                <select
                    id="type-siege"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="form-control"
                >
                    <option value="">-- Choisir un type de siège --</option>
                    {types.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            {selectedType && (
                <div className="selection-summary">
                    <p><strong>Siège sélectionné:</strong> {selectedType}</p>
                </div>
            )}
        </div>
    );
};

export default SiegeSelector;


/**
 * Version avec options de confort
 */
const SiegeSelectorAdvanced = ({ onConfigSelected, initialConfig }) => {
    const [types, setTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(initialConfig?.nom_siege || '');
    const [ventilation, setVentilation] = useState(initialConfig?.options_confort?.ventilation || false);
    const [chauffage, setChauffage] = useState(initialConfig?.options_confort?.chauffage || false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/siege/types')
            .then(res => setTypes(res.data))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (selectedType && onConfigSelected) {
            onConfigSelected({
                nom_siege: selectedType,
                options_confort: {
                    ventilation,
                    chauffage,
                },
            });
        }
    }, [selectedType, ventilation, chauffage, onConfigSelected]);

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="siege-selector-advanced">
            <h3>Configuration des sièges</h3>

            {/* Type de siège */}
            <div className="form-group">
                <label htmlFor="type-siege">Type de siège:</label>
                <select
                    id="type-siege"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="form-control"
                >
                    <option value="">-- Choisir --</option>
                    {types.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Options de confort */}
            {selectedType && (
                <div className="options-confort">
                    <h4>Options de confort</h4>

                    <div className="checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={ventilation}
                                onChange={(e) => setVentilation(e.target.checked)}
                            />
                            <span>Ventilation des sièges</span>
                        </label>
                    </div>

                    <div className="checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={chauffage}
                                onChange={(e) => setChauffage(e.target.checked)}
                            />
                            <span>Chauffage des sièges</span>
                        </label>
                    </div>
                </div>
            )}

            {/* Résumé */}
            {selectedType && (
                <div className="config-summary">
                    <h4>Configuration sélectionnée:</h4>
                    <ul>
                        <li>Type: {selectedType}</li>
                        {ventilation && <li>✓ Ventilation</li>}
                        {chauffage && <li>✓ Chauffage</li>}
                    </ul>
                </div>
            )}
        </div>
    );
};


/**
 * Exemple d'utilisation
 */
const ConfigurateurVoiture = () => {
    const [siegeConfig, setSiegeConfig] = useState(null);

    const handleSiegeSelected = (type) => {
        console.log('Type de siège sélectionné:', type);
        setSiegeConfig({ nom_siege: type });
    };

    const handleConfigSelected = (config) => {
        console.log('Configuration complète:', config);
        setSiegeConfig(config);
    };

    return (
        <div className="configurateur">
            <h2>Configurateur de voiture Porsche</h2>

            {/* Version simple */}
            <SiegeSelector
                onSiegeSelected={handleSiegeSelected}
                currentSiege="Sièges sport"
            />

            {/* Ou version avancée */}
            {/* <SiegeSelectorAdvanced onConfigSelected={handleConfigSelected} /> */}

            {siegeConfig && (
                <div className="config-display">
                    <h3>Configuration actuelle:</h3>
                    <pre>{JSON.stringify(siegeConfig, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export { SiegeSelector, SiegeSelectorAdvanced };
