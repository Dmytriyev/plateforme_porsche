import './Modal.css';

/**
 * Composant Modal - Fenêtre modale avec CSS dédié
 * 
 * Props:
 * - isOpen: État ouvert/fermé
 * - onClose: Fonction pour fermer
 * - title: Titre de la modale
 * - children: Contenu de la modale
 * - size: 'sm' | 'md' | 'lg' | 'xl'
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose} />
      <div className={`modal-content modal-${size}`}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
