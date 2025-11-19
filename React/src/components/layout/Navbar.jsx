import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { usePanier } from '../../hooks/usePanier.jsx';
import './Navbar.css';

/**
 * Composant Navbar - Barre de navigation simplifiée
 * 
 * EXPLICATION POUR ÉTUDIANT:
 * ==========================
 * Cette navbar simplifiée contient uniquement :
 * - Logo Porsche (bouton accueil)
 * - Bouton "Voitures"
 * - Bouton "Accessoires"
 * - Logo panier
 * - Logo buste (mon compte)
 * - Bouton connexion/déconnexion
 */
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { nombreArticles } = usePanier();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo Porsche (bouton accueil) */}
          <Link to="/" className="navbar-logo">
            <img 
              src="/Logo/Logo_red.svg.png" 
              alt="Porsche Logo" 
              className="navbar-logo-img"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline';
              }}
            />
            <span className="navbar-logo-text" style={{ display: 'none' }}>PORSCHE</span>
          </Link>

          {/* Navigation Desktop */}
          <div className="navbar-links-desktop">
            <Link to="/choix-voiture" className="navbar-link">
              Voitures
            </Link>
            <Link to="/accessoires" className="navbar-link">
              Accessoires
            </Link>
          </div>

          {/* Actions Desktop */}
          <div className="navbar-actions-desktop">
            {/* Panier */}
            <Link to="/panier" className="navbar-cart">
              <svg className="navbar-cart-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {nombreArticles > 0 && (
                <span className="navbar-cart-badge">
                  {nombreArticles}
                </span>
              )}
            </Link>

            {/* Logo buste (Mon compte) */}
            {isAuthenticated() && (
              <Link to="/mon-compte" className="navbar-account">
                <svg className="navbar-account-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            {/* Authentification */}
            {isAuthenticated() ? (
              <button
                onClick={logout}
                className="navbar-btn-logout"
              >
                Déconnexion
              </button>
            ) : (
              <Link
                to="/login"
                className="navbar-btn-login"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Bouton Menu Mobile */}
          <button
            onClick={toggleMobileMenu}
            className="navbar-menu-btn"
          >
            <svg className="navbar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="navbar-mobile">
            <Link to="/choix-voiture" className="navbar-mobile-link">
              Voitures
            </Link>
            <Link to="/accessoires" className="navbar-mobile-link">
              Accessoires
            </Link>
            <Link to="/panier" className="navbar-mobile-link">
              Panier {nombreArticles > 0 && `(${nombreArticles})`}
            </Link>
            {isAuthenticated() && (
              <Link to="/mon-compte" className="navbar-mobile-link">
                Mon Compte
              </Link>
            )}
            {isAuthenticated() ? (
              <button
                onClick={logout}
                className="navbar-mobile-btn"
              >
                Déconnexion
              </button>
            ) : (
              <Link to="/login" className="navbar-mobile-link">
                Connexion
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

