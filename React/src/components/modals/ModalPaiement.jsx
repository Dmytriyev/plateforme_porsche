import { useState } from 'react';
import { staffService } from '../../services';
import { formatPrice, formatDate } from '../../utils/format.js';
import '../../css/Modal.css';

/**
 * Modal pour gérer les paiements d'une commande
 * Permet d'enregistrer un acompte, paiement total, date de livraison
 */
const ModalPaiement = ({ commande, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        montant: '',
        type_paiement: 'acompte',
        date_livraison_prevue: '',
        note_interne: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const restant = commande.prix - commande.acompte;
    const pourcentagePaye = ((commande.acompte / commande.prix) * 100).toFixed(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTypePaiementChange = (type) => {
        setFormData(prev => ({
            ...prev,
            type_paiement: type,
            montant: type === 'total' ? restant.toString() : ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const montant = parseFloat(formData.montant);

            if (isNaN(montant) || montant <= 0) {
                setError('Veuillez entrer un montant valide');
                setLoading(false);
                return;
            }

            if (montant > restant) {
                setError(`Le montant ne peut pas dépasser ${formatPrice(restant)}`);
                setLoading(false);
                return;
            }

            await staffService.mettreAJourPaiement(commande._id, {
                montant,
                date_livraison_prevue: formData.date_livraison_prevue || undefined,
                note_interne: formData.note_interne || undefined
            });

            onSuccess();
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'enregistrement du paiement');
        } finally {
            setLoading(false);
        }
    };

    const handleMarquerLivree = async () => {
        if (!window.confirm('Confirmer la livraison de cette commande ?')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            await staffService.marquerCommeLivree(commande._id, {
                note_interne: formData.note_interne || undefined
            });
            onSuccess();
        } catch (err) {
            setError(err.message || 'Erreur lors de la mise à jour');
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container modal-container-medium" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Gestion du paiement</h2>
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

                    {/* Informations commande */}
                    <div className="modal-info-box">
                        <h3>Commande #{commande._id.substring(0, 8)}</h3>
                        <div className="modal-info-grid">
                            <div className="modal-info-item">
                                <span className="modal-info-label">Client:</span>
                                <span className="modal-info-value">
                                    {commande.user?.prenom} {commande.user?.nom}
                                </span>
                            </div>
                            <div className="modal-info-item">
                                <span className="modal-info-label">Date commande:</span>
                                <span className="modal-info-value">{formatDate(commande.date_commande)}</span>
                            </div>
                            <div className="modal-info-item">
                                <span className="modal-info-label">Montant total:</span>
                                <span className="modal-info-value">{formatPrice(commande.prix)}</span>
                            </div>
                            <div className="modal-info-item">
                                <span className="modal-info-label">Montant payé:</span>
                                <span className="modal-info-value">{formatPrice(commande.acompte)}</span>
                            </div>
                            <div className="modal-info-item">
                                <span className="modal-info-label">Reste à payer:</span>
                                <span className="modal-info-value" style={{ color: 'var(--color-red-porsche)', fontWeight: 'bold' }}>
                                    {formatPrice(restant)}
                                </span>
                            </div>
                            <div className="modal-info-item">
                                <span className="modal-info-label">Progression:</span>
                                <span className="modal-info-value">{pourcentagePaye}% payé</span>
                            </div>
                        </div>

                        <div className="modal-progress-bar">
                            <div
                                className="modal-progress-fill"
                                style={{ width: `${pourcentagePaye}%` }}
                            />
                        </div>
                    </div>

                    {/* Formulaire de paiement */}
                    {restant > 0 && (
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="modal-form-group">
                                <label>Type de paiement</label>
                                <div className="modal-radio-group">
                                    <label className="modal-radio-label">
                                        <input
                                            type="radio"
                                            name="type_paiement"
                                            value="acompte"
                                            checked={formData.type_paiement === 'acompte'}
                                            onChange={() => handleTypePaiementChange('acompte')}
                                        />
                                        <span>Acompte partiel</span>
                                    </label>
                                    <label className="modal-radio-label">
                                        <input
                                            type="radio"
                                            name="type_paiement"
                                            value="total"
                                            checked={formData.type_paiement === 'total'}
                                            onChange={() => handleTypePaiementChange('total')}
                                        />
                                        <span>Paiement complet ({formatPrice(restant)})</span>
                                    </label>
                                </div>
                            </div>

                            <div className="modal-form-group">
                                <label htmlFor="montant">
                                    Montant à encaisser (€) *
                                </label>
                                <input
                                    type="number"
                                    id="montant"
                                    name="montant"
                                    value={formData.montant}
                                    onChange={handleChange}
                                    required
                                    min="0.01"
                                    max={restant}
                                    step="0.01"
                                    placeholder={`Maximum: ${formatPrice(restant)}`}
                                    disabled={formData.type_paiement === 'total'}
                                />
                                <small className="modal-form-hint">
                                    Reste à payer: {formatPrice(restant)}
                                </small>
                            </div>

                            <div className="modal-form-group">
                                <label htmlFor="date_livraison_prevue">
                                    Date de livraison prévue (optionnel)
                                </label>
                                <input
                                    type="date"
                                    id="date_livraison_prevue"
                                    name="date_livraison_prevue"
                                    value={formData.date_livraison_prevue}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="modal-form-group">
                                <label htmlFor="note_interne">
                                    Note interne (optionnel)
                                </label>
                                <textarea
                                    id="note_interne"
                                    name="note_interne"
                                    value={formData.note_interne}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Notes pour le suivi interne..."
                                />
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
                                    {loading ? 'Enregistrement...' : 'Enregistrer le paiement'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Actions si paiement complet */}
                    {restant === 0 && (
                        <div className="modal-section">
                            <div className="modal-success-message">
                                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p>Cette commande est entièrement payée</p>
                            </div>

                            {commande.statut_livraison !== 'livree' && (
                                <>
                                    <div className="modal-form-group">
                                        <label htmlFor="note_interne">
                                            Note de livraison (optionnel)
                                        </label>
                                        <textarea
                                            id="note_interne"
                                            name="note_interne"
                                            value={formData.note_interne}
                                            onChange={handleChange}
                                            rows="3"
                                            placeholder="Notes concernant la livraison..."
                                        />
                                    </div>

                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="modal-btn modal-btn-secondary"
                                            onClick={onClose}
                                            disabled={loading}
                                        >
                                            Fermer
                                        </button>
                                        <button
                                            type="button"
                                            className="modal-btn modal-btn-success"
                                            onClick={handleMarquerLivree}
                                            disabled={loading}
                                        >
                                            {loading ? 'Enregistrement...' : 'Marquer comme livrée'}
                                        </button>
                                    </div>
                                </>
                            )}

                            {commande.statut_livraison === 'livree' && (
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="modal-btn modal-btn-secondary"
                                        onClick={onClose}
                                    >
                                        Fermer
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModalPaiement;
