import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { modelPorscheService, voitureService, personnalisationService } from '../services';
import { Loading } from '../components/common';
import { formatPrice } from '../utils/format.js';
import '../css/AjouterModelPorsche.css';

const AjouterModelPorsche = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Options
    const [voitures, setVoitures] = useState([]);
    const [couleursExt, setCouleursExt] = useState([]);
    const [couleursInt, setCouleursInt] = useState([]);
    const [jantes, setJantes] = useState([]);
    const [sieges, setSieges] = useState([]);
    const [packages, setPackages] = useState([]);

    // Photos
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);

    // Formulaire
    const [formData, setFormData] = useState({
        voiture: '',
        nom_model: '',
        type_carrosserie: '',
        etat: 'occasion',
        prix_base: '',
        kilometrage: '',
        annee: '',
        carburant: 'Essence',
        boite_vitesse: 'Automatique',
        nb_proprietaires: '1',
        description: '',
        numero_vin: '',
        concessionnaire: '',
        adresse: '',
        couleur_exterieur: '',
        couleur_interieur: '',
        taille_jante: '',
        siege: '',
        package: [],
        // Spécifications
        puissance: '',
        couple: '',
        transmission: '',
        acceleration_0_100: '',
        vitesse_max: '',
        consommation: '',
        pack_sport_chrono: false,
        pack_weissach: false,
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setLoading(true);
                setError('');

                const [voituresData, couleursExtData, couleursIntData, jantesData, siegesData, packagesData] =
                    await Promise.all([
                        voitureService.getAllVoitures(),
                        personnalisationService.getCouleursExterieur(),
                        personnalisationService.getCouleursInterieur(),
                        personnalisationService.getJantes(),
                        personnalisationService.getSieges(),
                        personnalisationService.getPackages(),
                    ]);

                setVoitures(Array.isArray(voituresData) ? voituresData : []);
                setCouleursExt(couleursExtData);
                setCouleursInt(couleursIntData);
                setJantes(jantesData);
                setSieges(siegesData);
                setPackages(packagesData);
            } catch (err) {
                setError(err.message || 'Erreur lors du chargement des options');
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'voiture' && value) {
            const voitureSelectionnee = voitures.find(v => v._id === value);
            if (voitureSelectionnee) {
                setFormData(prev => ({
                    ...prev,
                    voiture: value,
                    nom_model: voitureSelectionnee.nom_model || ''
                }));
                return;
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePackageChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            package: checked
                ? [...prev.package, value]
                : prev.package.filter(p => p !== value)
        }));
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        if (photos.length + files.length > 15) {
            setError('Maximum 15 photos autorisées');
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        const invalidFiles = files.filter(f => f.size > maxSize);
        if (invalidFiles.length > 0) {
            setError('Certaines photos dépassent 5MB');
            return;
        }

        setPhotos(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });

        setError('');
    };

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            // Préparer les données
            const dataToSend = {
                voiture: formData.voiture,
                nom_model: formData.nom_model,
                type_carrosserie: formData.type_carrosserie || undefined,
                etat: formData.etat,
                prix_base: parseFloat(formData.prix_base) || 0,
                kilometrage: parseFloat(formData.kilometrage) || 0,
                annee: parseInt(formData.annee) || new Date().getFullYear(),
                carburant: formData.carburant,
                boite_vitesse: formData.boite_vitesse,
                nb_proprietaires: parseInt(formData.nb_proprietaires) || 1,
                description: formData.description || undefined,
                numero_vin: formData.numero_vin || undefined,
                concessionnaire: formData.concessionnaire || undefined,
                adresse: formData.adresse || undefined,
                couleur_exterieur: formData.couleur_exterieur || undefined,
                couleur_interieur: formData.couleur_interieur || undefined,
                taille_jante: formData.taille_jante || undefined,
                siege: formData.siege || undefined,
                package: formData.package.length > 0 ? formData.package : undefined,
                specifications: {}
            };

            // Ajouter les spécifications
            if (formData.puissance) dataToSend.specifications.puissance = formData.puissance;
            if (formData.couple) dataToSend.specifications.couple = formData.couple;
            if (formData.transmission) dataToSend.specifications.transmission = formData.transmission;
            if (formData.acceleration_0_100) dataToSend.specifications.acceleration_0_100 = formData.acceleration_0_100;
            if (formData.vitesse_max) dataToSend.specifications.vitesse_max = formData.vitesse_max;
            if (formData.consommation) dataToSend.specifications.consommation = formData.consommation;
            dataToSend.specifications.pack_sport_chrono = formData.pack_sport_chrono;
            dataToSend.specifications.pack_weissach = formData.pack_weissach;

            if (Object.keys(dataToSend.specifications).length === 2 &&
                !dataToSend.specifications.pack_sport_chrono &&
                !dataToSend.specifications.pack_weissach) {
                delete dataToSend.specifications;
            }

            // Créer le model_porsche
            const nouveauModel = await modelPorscheService.createModelPorsche(dataToSend);

            // Upload des photos si présentes
            if (photos.length > 0 && nouveauModel._id) {
                const photoFormData = new FormData();
                photos.forEach(photo => {
                    photoFormData.append('photos', photo);
                });
                photoFormData.append('model_porsche', nouveauModel._id);
                photoFormData.append('alt', `${formData.nom_model} photo`);

                try {
                    await modelPorscheService.ajouterPhotos(nouveauModel._id, photoFormData);
                } catch (photoError) {
                    console.error('Erreur upload photos:', photoError);
                }
            }

            setSuccess('Voiture créée avec succès !');
            setTimeout(() => {
                navigate(`/occasion/${nouveauModel._id}`);
            }, 1500);
        } catch (err) {
            setError(err.message || 'Erreur lors de la création');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loading fullScreen message="Chargement..." />;
    }

    return (
        <div className="ajouter-model-porsche-container">
            <div className="ajouter-model-porsche-breadcrumb">
                <button
                    className="ajouter-model-porsche-back-btn"
                    onClick={() => navigate(-1)}
                >
                    ← Retour
                </button>
            </div>

            <div className="ajouter-model-porsche-header">
                <h1 className="ajouter-model-porsche-title">Ajouter une voiture</h1>
                <p className="ajouter-model-porsche-subtitle">Créez une nouvelle Porsche</p>
            </div>

            <div className="ajouter-model-porsche-content">
                {error && (
                    <div className="message-box message-error">
                        <p>{error}</p>
                    </div>
                )}
                {success && (
                    <div className="message-box message-success">
                        <p>{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="ajouter-model-porsche-form">
                    {/* Informations de base */}
                    <div className="ajouter-model-porsche-section">
                        <h2 className="ajouter-model-porsche-section-title">Informations de base</h2>

                        <div className="ajouter-model-porsche-form-row">
                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="voiture" className="ajouter-model-porsche-label">
                                    Modèle de base * <span className="label-hint">(911, Cayenne, etc.)</span>
                                </label>
                                <select
                                    id="voiture"
                                    name="voiture"
                                    value={formData.voiture}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-select"
                                    required
                                >
                                    <option value="">-- Sélectionner --</option>
                                    {voitures.map(voiture => (
                                        <option key={voiture._id} value={voiture._id}>
                                            {voiture.nom_model}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="nom_model" className="ajouter-model-porsche-label">
                                    Variante * <span className="label-hint">(Ex: 911 Carrera S)</span>
                                </label>
                                <input
                                    type="text"
                                    id="nom_model"
                                    name="nom_model"
                                    value={formData.nom_model}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-input"
                                    required
                                    placeholder="911 Carrera S"
                                />
                            </div>
                        </div>

                        <div className="ajouter-model-porsche-form-row">
                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="type_carrosserie" className="ajouter-model-porsche-label">
                                    Type de carrosserie
                                </label>
                                <select
                                    id="type_carrosserie"
                                    name="type_carrosserie"
                                    value={formData.type_carrosserie}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-select"
                                >
                                    <option value="">-- Sélectionner --</option>
                                    <option value="Coupé">Coupé</option>
                                    <option value="Cabriolet">Cabriolet</option>
                                    <option value="Targa">Targa</option>
                                    <option value="SUV">SUV</option>
                                    <option value="Berline">Berline</option>
                                </select>
                            </div>

                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="etat" className="ajouter-model-porsche-label">
                                    État *
                                </label>
                                <select
                                    id="etat"
                                    name="etat"
                                    value={formData.etat}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-select"
                                    required
                                >
                                    <option value="occasion">Occasion</option>
                                    <option value="neuf">Neuf</option>
                                </select>
                            </div>
                        </div>

                        <div className="ajouter-model-porsche-form-row">
                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="prix_base" className="ajouter-model-porsche-label">
                                    Prix (€) *
                                </label>
                                <input
                                    type="number"
                                    id="prix_base"
                                    name="prix_base"
                                    value={formData.prix_base}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-input"
                                    required
                                    placeholder="85000"
                                    min="0"
                                    step="1000"
                                />
                            </div>

                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="annee" className="ajouter-model-porsche-label">
                                    Année *
                                </label>
                                <input
                                    type="number"
                                    id="annee"
                                    name="annee"
                                    value={formData.annee}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-input"
                                    required
                                    placeholder="2023"
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                />
                            </div>
                        </div>

                        <div className="ajouter-model-porsche-form-row">
                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="kilometrage" className="ajouter-model-porsche-label">
                                    Kilométrage (km) *
                                </label>
                                <input
                                    type="number"
                                    id="kilometrage"
                                    name="kilometrage"
                                    value={formData.kilometrage}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-input"
                                    required
                                    placeholder="25000"
                                    min="0"
                                />
                            </div>

                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="nb_proprietaires" className="ajouter-model-porsche-label">
                                    Nombre de propriétaires *
                                </label>
                                <input
                                    type="number"
                                    id="nb_proprietaires"
                                    name="nb_proprietaires"
                                    value={formData.nb_proprietaires}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-input"
                                    required
                                    placeholder="1"
                                    min="0"
                                    max="10"
                                />
                            </div>
                        </div>

                        <div className="ajouter-model-porsche-form-row">
                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="carburant" className="ajouter-model-porsche-label">
                                    Carburant *
                                </label>
                                <select
                                    id="carburant"
                                    name="carburant"
                                    value={formData.carburant}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-select"
                                    required
                                >
                                    <option value="Essence">Essence</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Hybride">Hybride</option>
                                    <option value="Électrique">Électrique</option>
                                </select>
                            </div>

                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="boite_vitesse" className="ajouter-model-porsche-label">
                                    Boîte de vitesse *
                                </label>
                                <select
                                    id="boite_vitesse"
                                    name="boite_vitesse"
                                    value={formData.boite_vitesse}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-select"
                                    required
                                >
                                    <option value="Automatique">Automatique</option>
                                    <option value="Manuelle">Manuelle</option>
                                    <option value="PDK">PDK</option>
                                </select>
                            </div>
                        </div>

                        <div className="ajouter-model-porsche-form-group">
                            <label htmlFor="description" className="ajouter-model-porsche-label">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="ajouter-model-porsche-textarea"
                                rows="4"
                                placeholder="Description détaillée du véhicule..."
                            />
                        </div>
                    </div>

                    {/* Informations concessionnaire */}
                    <div className="ajouter-model-porsche-section">
                        <h2 className="ajouter-model-porsche-section-title">Informations concessionnaire</h2>

                        <div className="ajouter-model-porsche-form-row">
                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="numero_vin" className="ajouter-model-porsche-label">
                                    Numéro VIN
                                </label>
                                <input
                                    type="text"
                                    id="numero_vin"
                                    name="numero_vin"
                                    value={formData.numero_vin}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-input"
                                    placeholder="WP0ZZZ99ZTS392155"
                                />
                            </div>

                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="concessionnaire" className="ajouter-model-porsche-label">
                                    Concessionnaire
                                </label>
                                <input
                                    type="text"
                                    id="concessionnaire"
                                    name="concessionnaire"
                                    value={formData.concessionnaire}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-input"
                                    placeholder="Porsche Centre Paris"
                                />
                            </div>
                        </div>

                        <div className="ajouter-model-porsche-form-group">
                            <label htmlFor="adresse" className="ajouter-model-porsche-label">
                                Adresse
                            </label>
                            <input
                                type="text"
                                id="adresse"
                                name="adresse"
                                value={formData.adresse}
                                onChange={handleChange}
                                className="ajouter-model-porsche-input"
                                placeholder="123 Avenue des Champs-Élysées, 75008 Paris"
                            />
                        </div>
                    </div>

                    {/* Personnalisation */}
                    <div className="ajouter-model-porsche-section">
                        <h2 className="ajouter-model-porsche-section-title">Personnalisation</h2>

                        <div className="ajouter-model-porsche-form-row">
                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="couleur_exterieur" className="ajouter-model-porsche-label">
                                    Couleur extérieure
                                </label>
                                <select
                                    id="couleur_exterieur"
                                    name="couleur_exterieur"
                                    value={formData.couleur_exterieur}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-select"
                                >
                                    <option value="">-- Sélectionner --</option>
                                    {couleursExt.map(couleur => (
                                        <option key={couleur._id} value={couleur._id}>
                                            {couleur.nom_couleur} {couleur.prix > 0 ? `(+${formatPrice(couleur.prix)})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="couleur_interieur" className="ajouter-model-porsche-label">
                                    Couleur intérieure
                                </label>
                                <select
                                    id="couleur_interieur"
                                    name="couleur_interieur"
                                    value={formData.couleur_interieur}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-select"
                                >
                                    <option value="">-- Sélectionner --</option>
                                    {couleursInt.map(couleur => (
                                        <option key={couleur._id} value={couleur._id}>
                                            {couleur.nom_couleur} {couleur.prix > 0 ? `(+${formatPrice(couleur.prix)})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="ajouter-model-porsche-form-row">
                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="taille_jante" className="ajouter-model-porsche-label">
                                    Jantes
                                </label>
                                <select
                                    id="taille_jante"
                                    name="taille_jante"
                                    value={formData.taille_jante}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-select"
                                >
                                    <option value="">-- Sélectionner --</option>
                                    {jantes.map(jante => (
                                        <option key={jante._id} value={jante._id}>
                                            {jante.taille_jante}" - {jante.description} {jante.prix > 0 ? `(+${formatPrice(jante.prix)})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="siege" className="ajouter-model-porsche-label">
                                    Sièges
                                </label>
                                <select
                                    id="siege"
                                    name="siege"
                                    value={formData.siege}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-select"
                                >
                                    <option value="">-- Sélectionner --</option>
                                    {sieges.map(siege => (
                                        <option key={siege._id} value={siege._id}>
                                            {siege.type_siege} {siege.prix > 0 ? `(+${formatPrice(siege.prix)})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Packages */}
                        <div className="ajouter-model-porsche-form-group">
                            <label className="ajouter-model-porsche-label">Packages</label>
                            <div className="ajouter-model-porsche-checkbox-list">
                                {packages.map(pkg => (
                                    <label key={pkg._id} className="ajouter-model-porsche-checkbox-label">
                                        <input
                                            type="checkbox"
                                            value={pkg._id}
                                            checked={formData.package.includes(pkg._id)}
                                            onChange={handlePackageChange}
                                            className="ajouter-model-porsche-checkbox"
                                        />
                                        <span>{pkg.nom_package} {pkg.prix > 0 ? `(+${formatPrice(pkg.prix)})` : ''}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Spécifications techniques */}
                    <div className="ajouter-model-porsche-section">
                        <h2 className="ajouter-model-porsche-section-title">Spécifications techniques</h2>

                        <div className="ajouter-model-porsche-form-row">
                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="puissance" className="ajouter-model-porsche-label">
                                    Puissance (ch)
                                </label>
                                <input
                                    type="text"
                                    id="puissance"
                                    name="puissance"
                                    value={formData.puissance}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-input"
                                    placeholder="385 ch"
                                />
                            </div>

                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="couple" className="ajouter-model-porsche-label">
                                    Couple (Nm)
                                </label>
                                <input
                                    type="text"
                                    id="couple"
                                    name="couple"
                                    value={formData.couple}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-input"
                                    placeholder="450 Nm"
                                />
                            </div>
                        </div>

                        <div className="ajouter-model-porsche-form-row">
                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="transmission" className="ajouter-model-porsche-label">
                                    Transmission
                                </label>
                                <input
                                    type="text"
                                    id="transmission"
                                    name="transmission"
                                    value={formData.transmission}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-input"
                                    placeholder="Propulsion"
                                />
                            </div>

                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="acceleration_0_100" className="ajouter-model-porsche-label">
                                    Accélération 0-100 km/h (s)
                                </label>
                                <input
                                    type="text"
                                    id="acceleration_0_100"
                                    name="acceleration_0_100"
                                    value={formData.acceleration_0_100}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-input"
                                    placeholder="4.2"
                                />
                            </div>
                        </div>

                        <div className="ajouter-model-porsche-form-row">
                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="vitesse_max" className="ajouter-model-porsche-label">
                                    Vitesse max (km/h)
                                </label>
                                <input
                                    type="text"
                                    id="vitesse_max"
                                    name="vitesse_max"
                                    value={formData.vitesse_max}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-input"
                                    placeholder="293"
                                />
                            </div>

                            <div className="ajouter-model-porsche-form-group">
                                <label htmlFor="consommation" className="ajouter-model-porsche-label">
                                    Consommation (L/100km)
                                </label>
                                <input
                                    type="text"
                                    id="consommation"
                                    name="consommation"
                                    value={formData.consommation}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-input"
                                    placeholder="10.5"
                                />
                            </div>
                        </div>

                        <div className="ajouter-model-porsche-checkbox-list">
                            <label className="ajouter-model-porsche-checkbox-label">
                                <input
                                    type="checkbox"
                                    name="pack_sport_chrono"
                                    checked={formData.pack_sport_chrono}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-checkbox"
                                />
                                <span>Pack Sport Chrono</span>
                            </label>

                            <label className="ajouter-model-porsche-checkbox-label">
                                <input
                                    type="checkbox"
                                    name="pack_weissach"
                                    checked={formData.pack_weissach}
                                    onChange={handleChange}
                                    className="ajouter-model-porsche-checkbox"
                                />
                                <span>Pack Weissach</span>
                            </label>
                        </div>
                    </div>

                    {/* Photos */}
                    <div className="ajouter-model-porsche-section">
                        <h2 className="ajouter-model-porsche-section-title">
                            Photos
                            <span className="label-hint"> (Maximum 15 photos, 5MB par photo)</span>
                        </h2>

                        <div className="ajouter-model-porsche-upload-area">
                            <input
                                type="file"
                                id="photos"
                                name="photos"
                                accept="image/*"
                                multiple
                                onChange={handlePhotoChange}
                                className="ajouter-model-porsche-file-input"
                            />
                            <label htmlFor="photos" className="ajouter-model-porsche-upload-label">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                <span>Cliquez pour ajouter des photos</span>
                                <span className="upload-hint">ou glissez-déposez vos images ici</span>
                            </label>
                        </div>

                        {photoPreviews.length > 0 && (
                            <div className="ajouter-model-porsche-photo-grid">
                                {photoPreviews.map((preview, index) => (
                                    <div key={index} className="ajouter-model-porsche-photo-item">
                                        <img src={preview} alt={`Preview ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="ajouter-model-porsche-photo-remove"
                                            onClick={() => removePhoto(index)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="ajouter-model-porsche-actions">
                        <button
                            type="button"
                            className="ajouter-model-porsche-btn ajouter-model-porsche-btn-cancel"
                            onClick={() => navigate(-1)}
                            disabled={saving}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="ajouter-model-porsche-btn ajouter-model-porsche-btn-save"
                            disabled={saving}
                        >
                            {saving ? 'Création en cours...' : 'Créer la voiture'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AjouterModelPorsche;
