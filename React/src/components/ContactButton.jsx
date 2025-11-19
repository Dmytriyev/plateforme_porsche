import { useNavigate } from 'react-router-dom';
import './ContactButton.css';

/**
 * Bouton de contact réutilisable
 * @param {Object} props
 * @param {string} props.vehiculeId - ID du véhicule concerné
 * @param {string} props.typeVehicule - Type de véhicule ('occasion', 'neuf', etc.)
 * @param {string} props.className - Classes CSS supplémentaires
 * @param {string} props.variant - Variante du bouton ('primary', 'secondary', 'outline')
 */
const ContactButton = ({ vehiculeId, typeVehicule = 'occasion', className = '', variant = 'primary' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/demande-contact', {
      state: {
        vehiculeId,
        typeVehicule,
      },
    });
  };

  return (
    <button
      className={`contact-button contact-button-${variant} ${className}`}
      onClick={handleClick}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      Nous contacter
    </button>
  );
};

export default ContactButton;

