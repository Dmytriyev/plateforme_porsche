import '../../css/components/Alert.css';

const Alert = ({ type = 'info', message, onClose }) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '',
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
