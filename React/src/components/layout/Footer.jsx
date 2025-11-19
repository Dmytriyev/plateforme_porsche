import { Link } from 'react-router-dom';
import './Footer.css';

/**
 * Composant Footer - Pied de page
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Logo et description */}
          <div className="footer-brand">
            <h3 className="footer-logo">PORSCHE</h3>
            <p className="footer-description">
              Découvrez l'excellence automobile avec Porsche. Voitures neuves, d'occasion et accessoires premium.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="footer-section-title">Navigation</h4>
            <ul className="footer-list">
              <li>
                <Link to="/voitures" className="footer-link">
                  Voitures
                </Link>
              </li>
              <li>
                <Link to="/accessoires" className="footer-link">
                  Accessoires
                </Link>
              </li>
              <li>
                <Link to="/mon-compte" className="footer-link">
                  Mon Compte
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h4 className="footer-section-title">Informations</h4>
            <ul className="footer-list">
              <li>
                <Link to="/a-propos" className="footer-link">
                  À propos
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/conditions" className="footer-link">
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="footer-link">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-section-title">Contact</h4>
            <ul className="footer-contact">
              <li>01 23 45 67 89</li>
              <li>contact@porsche.fr</li>
              <li>Paris, France</li>
            </ul>

            {/* Réseaux sociaux */}
            <div className="footer-social">
              <a href="#" className="footer-social-link">
                <svg className="footer-social-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="footer-social-link">
                <svg className="footer-social-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-copyright">
          <p>&copy; {currentYear} Porsche. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
