import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import '../../css/components/ContactModal.css';

const ContactModal = ({ onClose, vehiculeInfo = null }) => {
    const { user, isAuthenticated } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '01 23 45 67 89',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);

    // Bloquer le scroll du body quand la modale est ouverte
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Fermer avec la touche Échap
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    useEffect(() => {
        if (isAuthenticated && user) {
            setFormData(prev => ({
                ...prev,
                nom: user.nom || '',
                prenom: user.prenom || ''
            }));
        }

        if (vehiculeInfo) {
            const messageAuto = `Je suis intéressé(e) par ${vehiculeInfo.nom_model}${vehiculeInfo.variante ? ` ${vehiculeInfo.variante}` : ''}${vehiculeInfo.prix ? ` (${vehiculeInfo.prix})` : ''}.\n\n`;
            setFormData(prev => ({
                ...prev,
                message: messageAuto
            }));
        }
    }, [isAuthenticated, user, vehiculeInfo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setSubmitted(true);

        setTimeout(() => {
            onClose();
        }, 2000);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (submitted) {
        return (
            <div className="contact-modal-overlay" onClick={handleBackdropClick}>
                <div className="contact-modal-content contact-modal-success">
                    <div className="contact-modal-success-icon">✓</div>
                    <h2 className="contact-modal-success-title">Message envoyé !</h2>
                    <p className="contact-modal-success-text">
                        Nous vous recontacterons dans les plus brefs délais.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="contact-modal-overlay" onClick={handleBackdropClick}>
            <div className="contact-modal-content">
                <button className="contact-modal-close" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <h2 className="contact-modal-title">Nous contacter</h2>
                <p className="contact-modal-subtitle">
                    Nos conseillers sont à votre disposition pour répondre à toutes vos questions.
                </p>

                <form onSubmit={handleSubmit} className="contact-modal-form">
                    <div className="contact-modal-row">
                        <div className="contact-modal-field">
                            <label htmlFor="nom">Nom *</label>
                            <input
                                type="text"
                                id="nom"
                                name="nom"
                                value={formData.nom}
                                onChange={handleChange}
                                required
                                placeholder="Votre nom"
                            />
                        </div>

                        <div className="contact-modal-field">
                            <label htmlFor="prenom">Prénom *</label>
                            <input
                                type="text"
                                id="prenom"
                                name="prenom"
                                value={formData.prenom}
                                onChange={handleChange}
                                required
                                placeholder="Votre prénom"
                            />
                        </div>
                    </div>

                    <div className="contact-modal-field">
                        <label htmlFor="email">Email Porsche</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value="contact@porsche.fr"
                            readOnly
                            className="contact-modal-readonly"
                        />
                    </div>

                    <div className="contact-modal-field">
                        <label htmlFor="telephone">Téléphone</label>
                        <input
                            type="tel"
                            id="telephone"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            className="contact-modal-readonly"
                            readOnly
                        />
                    </div>

                    <div className="contact-modal-field">
                        <label htmlFor="message">Votre message *</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows="5"
                            placeholder="Décrivez votre demande..."
                        />
                    </div>

                    <div className="contact-modal-info">
                        <p>
                            <strong>Horaires d'ouverture :</strong><br />
                            Du lundi au vendredi : 9h - 18h<br />
                            Samedi : 9h - 17h
                        </p>
                    </div>

                    <div className="contact-modal-actions">
                        <button type="button" onClick={onClose} className="contact-modal-btn-cancel">
                            Annuler
                        </button>
                        <button type="submit" className="contact-modal-btn-submit">
                            Envoyer le message
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactModal;
