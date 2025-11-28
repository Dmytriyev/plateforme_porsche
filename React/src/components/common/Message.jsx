/**
 * Composant pour afficher des messages (succès, erreur, info, warning)
 * Réutilisable dans toute l'application
 */
import PropTypes from "prop-types";
import "../../css/components/Message.css";

const Message = ({ type = "info", message, onClose }) => {
    if (!message) return null;

    const getClassName = () => {
        const baseClass = "modifier-accessoire-message";
        switch (type) {
            case "success":
                return `${baseClass} ${baseClass}-success`;
            case "error":
                return `${baseClass} ${baseClass}-error`;
            case "warning":
                return `${baseClass} ${baseClass}-warning`;
            default:
                return `${baseClass} ${baseClass}-info`;
        }
    };

    const getIcon = () => {
        switch (type) {
            case "success":
                return (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                            d="M4 10L8 14L16 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                );
            case "error":
                return (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                            d="M10 6V10M10 14H10.01"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
                    </svg>
                );
            case "warning":
                return (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                            d="M10 6V10M10 14H10.01"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                );
            default:
                return (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
                        <path d="M10 10V14M10 6H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                );
        }
    };

    return (
        <div className={getClassName()} role="alert" aria-live="polite">
            <div className="message-icon">{getIcon()}</div>
            <div className="message-text">{message}</div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="message-close"
                    aria-label="Fermer le message"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                            d="M4 4L12 12M4 12L12 4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
};

Message.propTypes = {
    type: PropTypes.oneOf(["success", "error", "warning", "info"]),
    message: PropTypes.string,
    onClose: PropTypes.func,
};

export default Message;
