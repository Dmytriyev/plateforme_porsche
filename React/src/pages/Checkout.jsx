import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import commandeService from '../services/commande.service.js';
import '../css/Checkout.css';

/**
 * Page Checkout - Paiement Stripe
 * 
 * NOTE IMPORTANTE sur les avertissements de la console :
 * Les avertissements "<link rel=preload>" et "passive event listener" 
 * proviennent de l'iframe Stripe Checkout et sont NORMAUX.
 * Ils n'affectent pas le fonctionnement du paiement.
 * Ces avertissements sont générés par le code interne de Stripe 
 * et ne peuvent pas être contrôlés depuis notre application.
 */
const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [panier, setPanier] = useState(null);
    const [lignesCommande, setLignesCommande] = useState([]);
    const [processingPayment, setProcessingPayment] = useState(false);

    // États pour les informations de livraison modifiables
    const [livraisonInfo, setLivraisonInfo] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: '',
        code_postal: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        // Initialiser les informations de livraison avec les données de l'utilisateur
        setLivraisonInfo({
            nom: user.nom || '',
            prenom: user.prenom || '',
            email: user.email || '',
            telephone: user.telephone || '',
            adresse: user.adresse || '',
            code_postal: user.code_postal || ''
        });
        fetchPanierData();
    }, [user]);

    const fetchPanierData = async () => {
        try {
            setLoading(true);
            const data = await commandeService.getPanier();
            console.log('Données panier reçues:', data);

            if (!data || !data.lignesCommande || data.lignesCommande.length === 0) {
                setError('Votre panier est vide');
                setLoading(false);
                return;
            }

            // Vérifier que le panier (commande) existe
            if (!data.commande || !data.commande._id) {
                console.error('Panier invalide:', data);
                setError('Impossible de charger le panier');
                setLoading(false);
                return;
            }

            console.log('Panier chargé:', data.commande._id);
            setPanier(data.commande);
            setLignesCommande(data.lignesCommande);
            setLoading(false);
        } catch (err) {
            console.error('Erreur lors du chargement du panier:', err);
            setError(err.message || 'Erreur lors du chargement du panier');
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        return lignesCommande.reduce((sum, ligne) => {
            if (ligne.voiture && ligne.type_produit === true) {
                return sum + (ligne.acompte || 0);
            } else if (ligne.accesoire) {
                return sum + (ligne.accesoire.prix * ligne.quantite);
            }
            return sum;
        }, 0);
    };

    const formatPrice = (prix) => {
        if (!prix) return '0,00 €';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(prix);
    };

    const handleLivraisonChange = (e) => {
        const { name, value } = e.target;
        setLivraisonInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateLivraisonInfo = () => {
        const { nom, prenom, email, telephone, adresse, code_postal } = livraisonInfo;

        if (!nom || !prenom) {
            setError('Le nom et le prénom sont obligatoires');
            return false;
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Email invalide');
            return false;
        }
        if (!telephone) {
            setError('Le téléphone est obligatoire');
            return false;
        }
        if (!adresse) {
            setError('L\'adresse est obligatoire');
            return false;
        }
        if (!code_postal) {
            setError('Le code postal est obligatoire');
            return false;
        }
        return true;
    };

    const handleProceedToPayment = async () => {
        if (!panier || !panier._id) {
            setError('Panier introuvable');
            return;
        }

        if (!lignesCommande || lignesCommande.length === 0) {
            setError('Votre panier est vide');
            return;
        }

        // Valider les informations de livraison avant de continuer
        if (!validateLivraisonInfo()) {
            return;
        }

        try {
            setProcessingPayment(true);
            setError(null);

            console.log('Création session de paiement pour panier:', panier._id);
            console.log('Nombre d\'articles:', lignesCommande.length);
            const response = await commandeService.createPaymentSession(panier._id);
            console.log('Réponse Stripe:', response);

            if (response && response.url) {
                console.log('Redirection vers Stripe:', response.url);
                // Rediriger vers la page de paiement Stripe
                window.location.href = response.url;
            } else {
                console.error('Réponse invalide:', response);
                throw new Error('URL de paiement non reçue');
            }
        } catch (err) {
            console.error('Erreur lors de la création de la session de paiement:', err);
            setError(err.message || 'Erreur lors de la création de la session de paiement');
            setProcessingPayment(false);
        }
    };

    if (!user) {
        return (
            <div className="checkout-error">
                <p>Vous devez être connecté pour passer commande</p>
                <button onClick={() => navigate('/login')}>Se connecter</button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="checkout-loading">
                <div className="checkout-spinner"></div>
                <p>Chargement de votre commande...</p>
            </div>
        );
    }

    if (error && !panier) {
        return (
            <div className="checkout-error">
                <h2>Erreur</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/panier')} className="checkout-btn-back">
                    Retour au panier
                </button>
            </div>
        );
    }

    const total = calculateTotal();
    const nombreArticles = lignesCommande.reduce((sum, ligne) => sum + ligne.quantite, 0);

    return (
        <div className="checkout-container">
            <div className="checkout-content">
                <h1 className="checkout-title">Finaliser votre commande</h1>

                {error && (
                    <div className="checkout-error-message">
                        <p>{error}</p>
                    </div>
                )}

                {/* Informations de livraison */}
                <section className="checkout-section">
                    <h2 className="checkout-section-title">Informations de livraison</h2>
                    <div className="checkout-info-form">
                        <div className="checkout-form-row">
                            <div className="checkout-form-group">
                                <label htmlFor="nom" className="checkout-form-label">Nom *</label>
                                <input
                                    type="text"
                                    id="nom"
                                    name="nom"
                                    value={livraisonInfo.nom}
                                    onChange={handleLivraisonChange}
                                    className="checkout-form-input"
                                    placeholder="Votre nom"
                                    required
                                />
                            </div>
                            <div className="checkout-form-group">
                                <label htmlFor="prenom" className="checkout-form-label">Prénom *</label>
                                <input
                                    type="text"
                                    id="prenom"
                                    name="prenom"
                                    value={livraisonInfo.prenom}
                                    onChange={handleLivraisonChange}
                                    className="checkout-form-input"
                                    placeholder="Votre prénom"
                                    required
                                />
                            </div>
                        </div>

                        <div className="checkout-form-row">
                            <div className="checkout-form-group">
                                <label htmlFor="email" className="checkout-form-label">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={livraisonInfo.email}
                                    onChange={handleLivraisonChange}
                                    className="checkout-form-input"
                                    placeholder="votre@email.com"
                                    required
                                />
                            </div>
                            <div className="checkout-form-group">
                                <label htmlFor="telephone" className="checkout-form-label">Téléphone *</label>
                                <input
                                    type="tel"
                                    id="telephone"
                                    name="telephone"
                                    value={livraisonInfo.telephone}
                                    onChange={handleLivraisonChange}
                                    className="checkout-form-input"
                                    placeholder="06 12 34 56 78"
                                    required
                                />
                            </div>
                        </div>

                        <div className="checkout-form-group">
                            <label htmlFor="adresse" className="checkout-form-label">Adresse *</label>
                            <input
                                type="text"
                                id="adresse"
                                name="adresse"
                                value={livraisonInfo.adresse}
                                onChange={handleLivraisonChange}
                                className="checkout-form-input"
                                placeholder="Numéro et nom de rue"
                                required
                            />
                        </div>

                        <div className="checkout-form-group">
                            <label htmlFor="code_postal" className="checkout-form-label">Code postal *</label>
                            <input
                                type="text"
                                id="code_postal"
                                name="code_postal"
                                value={livraisonInfo.code_postal}
                                onChange={handleLivraisonChange}
                                className="checkout-form-input"
                                placeholder="75001"
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* Récapitulatif de la commande */}
                <section className="checkout-section">
                    <h2 className="checkout-section-title">Récapitulatif de votre commande</h2>
                    <div className="checkout-items">
                        {lignesCommande.map((ligne) => {
                            const isVoiture = ligne.type_produit === true;
                            let nom = '';
                            let prix = 0;

                            if (isVoiture && ligne.voiture) {
                                nom = `Porsche ${ligne.voiture.nom_model}`;
                                if (ligne.voiture.variante) nom += ` ${ligne.voiture.variante}`;
                                prix = ligne.acompte || 0;
                            } else if (ligne.accesoire) {
                                nom = ligne.accesoire.nom_accesoire;
                                prix = ligne.accesoire.prix;
                            }

                            return (
                                <div key={ligne._id} className="checkout-item">
                                    <div className="checkout-item-details">
                                        <h3 className="checkout-item-name">{nom}</h3>
                                        <p className="checkout-item-quantity">Quantité : {ligne.quantite}</p>
                                        {isVoiture && (
                                            <p className="checkout-item-acompte">(Acompte de 10%)</p>
                                        )}
                                    </div>
                                    <div className="checkout-item-price">
                                        {formatPrice(prix * ligne.quantite)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Résumé du paiement */}
                <section className="checkout-section checkout-summary">
                    <h2 className="checkout-section-title">Résumé du paiement</h2>
                    <div className="checkout-summary-card">
                        <div className="checkout-summary-item">
                            <span>Articles ({nombreArticles})</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                        <div className="checkout-summary-item">
                            <span>Frais de livraison</span>
                            <span className="checkout-free">Gratuit</span>
                        </div>
                        <div className="checkout-summary-divider"></div>
                        <div className="checkout-summary-item checkout-summary-total">
                            <span>Total à payer</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                    </div>

                    <div className="checkout-actions">
                        <button
                            onClick={() => navigate('/panier')}
                            className="checkout-btn-back"
                            disabled={processingPayment}
                        >
                            Retour au panier
                        </button>
                        <button
                            onClick={handleProceedToPayment}
                            className="checkout-btn-pay"
                            disabled={processingPayment}
                        >
                            {processingPayment ? 'REDIRECTION EN COURS...' : 'PROCÉDER AU PAIEMENT'}
                        </button>
                    </div>

                    <div className="checkout-security-info">
                        <svg className="checkout-lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="5" y="11" width="14" height="10" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <p>Paiement sécurisé par Stripe</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Checkout;
