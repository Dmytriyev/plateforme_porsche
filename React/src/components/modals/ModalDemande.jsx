import { useState } from 'react';
import { staffService } from '../../services';
import { formatDate } from '../../utils/format.js';
import '../../css/Modal.css';

/**
 * Modal pour répondre à une demande de contact
 */
const ModalDemande = ({ demande, onClose, onSuccess }) => {
    const [reponse, setReponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reponse.trim()) {
            setError('Veuillez saisir une réponse');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await staffService.repondreDemandeContact(demande._id, {
                contenu: reponse
            });
            onSuccess();
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'envoi de la réponse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container modal-container-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Répondre à la demande de contact</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="modal-error">
                            {error}
                        </div>
                    )}

                    {/* Informations du client */}
                    <div className="modal-info-box">
                        <h3>Informations du client</h3>
                        <div className="modal-info-grid">
                            <div className="modal-info-item">
                                <span className="modal-info-label">Nom:</span>
                                <span className="modal-info-value">{demande.prenom} {demande.nom}</span>
                            </div>
                            <div className="modal-info-item">
                                <span className="modal-info-label">Email:</span>
                                <span className="modal-info-value">{demande.email}</span>
                            </div>
                            <div className="modal-info-item">
                                <span className="modal-info-label">Téléphone:</span>
                                <span className="modal-info-value">{demande.telephone || 'Non renseigné'}</span>
                            </div>
                            <div className="modal-info-item">
                                <span className="modal-info-label">Date:</span>
                                <span className="modal-info-value">{formatDate(demande.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Message du client */}
                    <div className="modal-section">
                        <h3 className="modal-section-title">Message du client</h3>
                        <div className="modal-message-display">
                            {demande.message}
                        </div>
                    </div>

                    {/* Historique des réponses */}
                    {demande.reponse && demande.reponse.length > 0 && (
                        <div className="modal-section">
                            <h3 className="modal-section-title">Historique des réponses</h3>
                            <div className="modal-reponses-list">
                                {demande.reponse.map((rep, index) => (
                                    <div key={index} className="modal-reponse-item">
                                        <div className="modal-reponse-header">
                                            <span className="modal-reponse-author">
                                                Par: {rep.staff_id?.prenom} {rep.staff_id?.nom}
                                            </span>
                                            <span className="modal-reponse-date">
                                                {formatDate(rep.date)}
                                            </span>
                                        </div>
                                        <div className="modal-reponse-content">
                                            {rep.contenu}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Formulaire de réponse */}
                    <form onSubmit={handleSubmit} className="modal-form">
                        <div className="modal-form-group">
                            <label htmlFor="reponse">
                                Votre réponse *
                            </label>
                            <textarea
                                id="reponse"
                                value={reponse}
                                onChange={(e) => setReponse(e.target.value)}
                                rows="8"
                                required
                                placeholder="Rédigez votre réponse au client..."
                                className="modal-textarea-large"
                            />
                            <small className="modal-form-hint">
                                Cette réponse sera envoyée par email au client
                            </small>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="modal-btn modal-btn-secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="modal-btn modal-btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Envoi en cours...' : 'Envoyer la réponse'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalDemande;
