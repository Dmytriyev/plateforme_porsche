/**
 * Composant: PackageSelector
 * Description: Sélecteur de packages Porsche (Weissach, Sport Chrono)
 * Usage: Permet aux utilisateurs de choisir un package prédéfini depuis une liste
 * API: GET /api/package/types pour récupérer les types disponibles
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * VERSION SIMPLE - Sélecteur basique de package
 */
const PackageSelector = ({ onPackageSelect, selectedPackage = '' }) => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPackageTypes();
    }, []);

    const fetchPackageTypes = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/package/types');

            if (response.data.success) {
                setPackages(response.data.data);
            }
            setError(null);
        } catch (err) {
            console.error('Erreur lors du chargement des packages:', err);
            setError('Impossible de charger les types de packages');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const selectedValue = e.target.value;
        if (onPackageSelect) {
            onPackageSelect(selectedValue);
        }
    };

    if (loading) {
        return <div className="package-selector-loading">Chargement des packages...</div>;
    }

    if (error) {
        return (
            <div className="package-selector-error">
                <p>{error}</p>
                <button onClick={fetchPackageTypes}>Réessayer</button>
            </div>
        );
    }

    return (
        <div className="package-selector">
            <label htmlFor="package-select">
                Sélectionner un package:
            </label>
            <select
                id="package-select"
                value={selectedPackage}
                onChange={handleChange}
                className="package-select-input"
            >
                <option value="">-- Choisir un package --</option>
                {packages.map((pkg) => (
                    <option key={pkg.value} value={pkg.value}>
                        {pkg.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

/**
 * VERSION AVANCÉE - Sélecteur avec descriptions et prix
 */
const AdvancedPackageSelector = ({
    onPackageSelect,
    selectedPackage = '',
    showDescription = true,
    showPrice = false
}) => {
    const [packages, setPackages] = useState([]);
    const [packagesData, setPackagesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Récupérer les types de packages disponibles
            const typesResponse = await axios.get('http://localhost:5000/api/package/types');
            if (typesResponse.data.success) {
                setPackages(typesResponse.data.data);
            }

            // Si on veut afficher les prix, récupérer tous les packages
            if (showPrice) {
                const allPackagesResponse = await axios.get('http://localhost:5000/api/package/all');
                setPackagesData(allPackagesResponse.data);
            }

            setError(null);
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            setError('Impossible de charger les packages');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const selectedValue = e.target.value;
        if (onPackageSelect) {
            onPackageSelect(selectedValue);
        }
    };

    const getPackageInfo = (packageType) => {
        if (!showPrice) return null;
        return packagesData.find(pkg => pkg.nom_package === packageType);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    if (loading) {
        return (
            <div className="advanced-package-selector-loading">
                <div className="spinner"></div>
                <p>Chargement des packages...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="advanced-package-selector-error">
                <p className="error-message">{error}</p>
                <button onClick={fetchData} className="retry-button">
                    Réessayer
                </button>
            </div>
        );
    }

    const packageDescriptions = {
        'Weissach': 'Package allégé pour performance maximale avec composants en carbone',
        'Sport Chrono': 'Package performance avec chronomètre et modes de conduite sportifs'
    };

    return (
        <div className="advanced-package-selector">
            <label htmlFor="advanced-package-select" className="package-label">
                Sélectionner un package Porsche:
            </label>

            <select
                id="advanced-package-select"
                value={selectedPackage}
                onChange={handleChange}
                className="advanced-package-select-input"
            >
                <option value="">-- Aucun package sélectionné --</option>
                {packages.map((pkg) => {
                    const packageInfo = getPackageInfo(pkg.value);
                    return (
                        <option key={pkg.value} value={pkg.value}>
                            {pkg.label}
                            {showPrice && packageInfo && ` - ${formatPrice(packageInfo.prix)}`}
                        </option>
                    );
                })}
            </select>

            {/* Affichage de la description du package sélectionné */}
            {showDescription && selectedPackage && (
                <div className="package-description">
                    <h4>{selectedPackage}</h4>
                    <p>{packageDescriptions[selectedPackage]}</p>
                    {showPrice && getPackageInfo(selectedPackage) && (
                        <p className="package-price">
                            Prix: {formatPrice(getPackageInfo(selectedPackage).prix)}
                        </p>
                    )}
                </div>
            )}

            {/* Affichage des cartes de packages */}
            {!selectedPackage && showDescription && (
                <div className="packages-grid">
                    {packages.map((pkg) => {
                        const packageInfo = getPackageInfo(pkg.value);
                        return (
                            <div
                                key={pkg.value}
                                className="package-card"
                                onClick={() => onPackageSelect && onPackageSelect(pkg.value)}
                            >
                                <h3>{pkg.label}</h3>
                                <p className="card-description">
                                    {packageDescriptions[pkg.value]}
                                </p>
                                {showPrice && packageInfo && (
                                    <p className="card-price">
                                        {formatPrice(packageInfo.prix)}
                                    </p>
                                )}
                                <button className="select-button">
                                    Sélectionner
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/**
 * EXEMPLE D'UTILISATION
 */
const PackageSelectorExample = () => {
    const [selectedPackage, setSelectedPackage] = useState('');
    const [packageData, setPackageData] = useState(null);

    const handlePackageSelection = async (packageType) => {
        setSelectedPackage(packageType);

        // Optionnel: Récupérer les détails complets du package
        if (packageType) {
            try {
                const response = await axios.get('http://localhost:5000/api/package/all');
                const packageDetails = response.data.find(pkg => pkg.nom_package === packageType);
                setPackageData(packageDetails);
            } catch (error) {
                console.error('Erreur lors de la récupération des détails:', error);
            }
        } else {
            setPackageData(null);
        }
    };

    return (
        <div className="example-container">
            <h2>Exemple de Sélecteur de Packages</h2>

            {/* Version Simple */}
            <section className="example-section">
                <h3>Version Simple</h3>
                <PackageSelector
                    selectedPackage={selectedPackage}
                    onPackageSelect={handlePackageSelection}
                />
            </section>

            {/* Version Avancée */}
            <section className="example-section">
                <h3>Version Avancée avec Descriptions</h3>
                <AdvancedPackageSelector
                    selectedPackage={selectedPackage}
                    onPackageSelect={handlePackageSelection}
                    showDescription={true}
                    showPrice={true}
                />
            </section>

            {/* Affichage de la sélection */}
            {selectedPackage && (
                <div className="selection-summary">
                    <h3>Package sélectionné:</h3>
                    <p><strong>Type:</strong> {selectedPackage}</p>
                    {packageData && (
                        <>
                            <p><strong>Description:</strong> {packageData.description}</p>
                            <p><strong>Prix:</strong> {packageData.prix}€</p>
                            {packageData.photo_package && (
                                <img
                                    src={packageData.photo_package}
                                    alt={selectedPackage}
                                    className="package-image"
                                />
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default PackageSelector;
export { AdvancedPackageSelector, PackageSelectorExample };

/**
 * STYLES CSS RECOMMANDÉS
 * 
 * .package-selector {
 *   margin: 20px 0;
 * }
 * 
 * .package-select-input {
 *   width: 100%;
 *   padding: 10px;
 *   border: 1px solid #ccc;
 *   border-radius: 4px;
 *   font-size: 16px;
 * }
 * 
 * .advanced-package-selector {
 *   margin: 20px 0;
 * }
 * 
 * .packages-grid {
 *   display: grid;
 *   grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
 *   gap: 20px;
 *   margin-top: 20px;
 * }
 * 
 * .package-card {
 *   border: 2px solid #e0e0e0;
 *   border-radius: 8px;
 *   padding: 20px;
 *   cursor: pointer;
 *   transition: all 0.3s ease;
 * }
 * 
 * .package-card:hover {
 *   border-color: #d5001c;
 *   box-shadow: 0 4px 12px rgba(213, 0, 28, 0.1);
 * }
 * 
 * .package-description {
 *   margin-top: 15px;
 *   padding: 15px;
 *   background-color: #f5f5f5;
 *   border-radius: 4px;
 * }
 * 
 * .select-button {
 *   background-color: #d5001c;
 *   color: white;
 *   border: none;
 *   padding: 10px 20px;
 *   border-radius: 4px;
 *   cursor: pointer;
 *   margin-top: 10px;
 * }
 */
