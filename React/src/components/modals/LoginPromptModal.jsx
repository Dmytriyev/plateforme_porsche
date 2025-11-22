import React from 'react';
import '../../css/components/Modal.css';
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
    primaryText = 'SE CONNECTER / CRÉER UN COMPTE',
    secondaryText = 'ANNULER',
}) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    <p className="modal-message-porsche">
                        {message}
                    </p>

                    <div className="modal-footer-porsche">
                        <button
                            type="button"
                            className="modal-btn-primary-porsche"
                            onClick={onLogin}
                        >
                            {primaryText}
                        </button>

                        <button
                            type="button"
                            className="modal-btn-secondary-porsche"
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
