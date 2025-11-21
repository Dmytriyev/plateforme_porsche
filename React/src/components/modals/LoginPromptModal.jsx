import React from 'react';
import '../../css/Modal.css';

// Composant modal réutilisable pour demander la connexion
// Props:
// - title: titre de la modal
// - message: message principal
// - primaryText: texte du bouton primaire
// - secondaryText: texte du bouton secondaire
// - onClose, onLogin, initialPath
const LoginPromptModal = ({
    onClose,
    onLogin,
    initialPath,
    title = 'Connexion requise',
    message = 'Vous devez être connecté pour continuer. Connectez-vous ou créez un compte pour poursuivre.',
    primaryText = 'Se connecter / Créer un compte',
    secondaryText = 'Annuler',
}) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container modal-container-small" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Connexion requise</h2>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
                    <p style={{ margin: 0, color: '#374151', fontWeight: 500 }}>
                        {message}
                    </p>

                    <div className="modal-footer modal-footer-login">
                        <button
                            type="button"
                            className="configurateur-btn-acheter login-btn-primary"
                            onClick={onLogin}
                        >
                            {primaryText}
                        </button>

                        <button
                            type="button"
                            className="configurateur-btn-contact login-btn-secondary"
                            onClick={onClose}
                        >
                            {secondaryText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPromptModal;
