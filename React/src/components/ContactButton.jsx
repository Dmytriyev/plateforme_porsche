import { useNavigate } from 'react-router-dom';
import '../css/ContactButton.css';

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
      NOUS CONTACTER
    </button>
  );
};

export default ContactButton;

