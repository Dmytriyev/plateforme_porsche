/**
 * components/modals/LoginPromptModal.jsx — Invite à se connecter pour actions protégées.
 *
 * @file components/modals/LoginPromptModal.jsx
 */

import { useEffect } from "react";
import "../../css/components/Modal.css";

const LoginPromptModal = ({
  onClose,
  onLogin,
  title = "Connexion requise",
  message = "Vous devez être connecté pour continuer. Connectez-vous ou créez un compte pour poursuivre.",
  primaryText = "SE CONNECTER / CRÉER UN COMPTE",
  secondaryText = "ANNULER",
}) => {
  // Bloquer le scroll du body quand la modale est ouverte
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Fermer avec la touche Échap
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-message-porsche">{message}</p>

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

// LoginPromptModal : invite l'utilisateur à se connecter avant actions protégées.
