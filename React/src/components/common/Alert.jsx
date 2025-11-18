import './Alert.css';

/**
 * Composant Alert - Message d'alerte avec CSS dédié
 * 
 * Props:
 * - type: 'success' | 'error' | 'warning' | 'info'
 * - message: Message à afficher
 * - onClose: Fonction pour fermer l'alerte
 */
const Alert = ({ type = 'info', message, onClose }) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-content">
        <span className="alert-icon">{icons[type]}</span>
        <p className="alert-message">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="alert-close">
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
