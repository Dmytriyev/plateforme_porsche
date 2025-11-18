/**
 * Composant React pour sélectionner une taille et couleur de jante
 * Utilise l'API pour récupérer les options disponibles
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const JanteSelector = ({ onJanteSelected, currentTaille, currentCouleur }) => {
    const [options, setOptions] = useState({ tailles: [], couleurs: [] });
    const [selectedTaille, setSelectedTaille] = useState(currentTaille || '');
    const [selectedCouleur, setSelectedCouleur] = useState(currentCouleur || '');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Récupérer les options disponibles
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await axios.get('/api/taille_jante/options');
                setOptions(response.data);
            } catch (err) {
                console.error('Erreur lors de la récupération des options:', err);
                setError('Impossible de charger les options');
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, []);

    // Notifier le parent quand la sélection change
    useEffect(() => {
        if (selectedTaille && selectedCouleur && onJanteSelected) {
            onJanteSelected({
                taille_jante: selectedTaille,
                couleur_jante: selectedCouleur,
            });
        }
    }, [selectedTaille, selectedCouleur, onJanteSelected]);

    if (loading) {
        return <div className="jante-selector-loading">Chargement des options...</div>;
    }

    if (error) {
        return <div className="jante-selector-error">{error}</div>;
    }

    return (
        <div className="jante-selector">
            <h3>Sélection de jantes</h3>

            <div className="form-group">
                <label htmlFor="taille-jante">Taille de jante:</label>
                <select
                    id="taille-jante"
                    value={selectedTaille}
                    onChange={(e) => setSelectedTaille(e.target.value)}
                    className="form-control"
                >
                    <option value="">-- Choisir une taille --</option>
                    {options.tailles.map((taille) => (
                        <option key={taille.value} value={taille.value}>
                            {taille.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="couleur-jante">Couleur de jante:</label>
                <select
                    id="couleur-jante"
                    value={selectedCouleur}
                    onChange={(e) => setSelectedCouleur(e.target.value)}
                    className="form-control"
                >
                    <option value="">-- Choisir une couleur --</option>
                    {options.couleurs.map((couleur) => (
                        <option key={couleur.value} value={couleur.value}>
                            {couleur.label}
                        </option>
                    ))}
                </select>
            </div>

            {selectedTaille && selectedCouleur && (
                <div className="selection-summary">
                    <p>
                        Sélection: Jante {selectedTaille}" - {selectedCouleur}
                    </p>
                </div>
            )}
        </div>
    );
};

export default JanteSelector;


/**
 * Exemple d'utilisation du composant
 */
const ConfigurateurVoiture = () => {
    const [janteConfig, setJanteConfig] = useState(null);

    const handleJanteSelected = (config) => {
        console.log('Configuration jante sélectionnée:', config);
        setJanteConfig(config);
    };

    return (
        <div className="configurateur">
            <h2>Configurateur de voiture</h2>

            <JanteSelector
                onJanteSelected={handleJanteSelected}
                currentTaille="19"
                currentCouleur="black"
            />

            {janteConfig && (
                <div className="config-summary">
                    <h3>Configuration actuelle:</h3>
                    <p>Taille: {janteConfig.taille_jante}"</p>
                    <p>Couleur: {janteConfig.couleur_jante}</p>
                </div>
            )}
        </div>
    );
};

/**
 * Version avec visualisation des couleurs
 */
const JanteSelectorWithColors = ({ onJanteSelected }) => {
    const [options, setOptions] = useState({ tailles: [], couleurs: [] });
    const [selectedTaille, setSelectedTaille] = useState('');
    const [selectedCouleur, setSelectedCouleur] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/taille_jante/options')
            .then(res => setOptions(res.data))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (selectedTaille && selectedCouleur && onJanteSelected) {
            onJanteSelected({
                taille_jante: selectedTaille,
                couleur_jante: selectedCouleur,
            });
        }
    }, [selectedTaille, selectedCouleur, onJanteSelected]);

    const getColorStyle = (colorName) => {
        const colors = {
            black: '#000000',
            gray: '#808080',
            red: '#FF0000',
            white: '#FFFFFF',
        };
        return colors[colorName] || '#CCCCCC';
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="jante-selector-advanced">
            <div className="taille-selection">
                <h4>Taille de jante</h4>
                <div className="taille-grid">
                    {options.tailles.map((taille) => (
                        <button
                            key={taille.value}
                            className={`taille-btn ${selectedTaille === taille.value ? 'selected' : ''}`}
                            onClick={() => setSelectedTaille(taille.value)}
                        >
                            {taille.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="couleur-selection">
                <h4>Couleur de jante</h4>
                <div className="couleur-grid">
                    {options.couleurs.map((couleur) => (
                        <div
                            key={couleur.value}
                            className={`couleur-option ${selectedCouleur === couleur.value ? 'selected' : ''}`}
                            onClick={() => setSelectedCouleur(couleur.value)}
                        >
                            <div
                                className="couleur-preview"
                                style={{ backgroundColor: getColorStyle(couleur.value) }}
                            />
                            <span>{couleur.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export { JanteSelector, JanteSelectorWithColors };
