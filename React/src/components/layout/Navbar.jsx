import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { PanierContext } from '../../context/PanierContext.jsx';
import '../../css/Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const { nombreArticles } = useContext(PanierContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const links = [
    { path: '/choix-voiture', title: 'Voitures' },
    { path: '/accessoires', title: 'Accessoires' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Left: Menu */}
          <div className="navbar-left">
            <button
              onClick={toggleMobileMenu}
              className="navbar-menu-btn"
              aria-haspopup="true"
              aria-expanded={mobileMenuOpen}
              aria-label="Menu"
            >
              <svg className="navbar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
              <span className="navbar-menu-text">Menu</span>
            </button>
          </div>

          {/* Center: Logo */}
          <div className="navbar-center">
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
          </div>

          {/* Right: Actions (Panier + Mon compte) */}
          <div className="navbar-right">
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

              {/* Logo buste (Mon compte) - toujours visible; va vers /mon-compte si connecté, sinon /login */}
              <Link to={isAuthenticated() ? "/mon-compte" : "/login"} className="navbar-account" aria-label="Mon compte">
                <svg className="navbar-account-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Menu (mobile dropdown or desktop dropdown depending on viewport) */}
        {mobileMenuOpen && (
          <>
            <div className="navbar-mobile">
              {links.map(item => (
                <Link key={item.path} to={item.path} className="navbar-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  {item.title}
                </Link>
              ))}
              <Link to="/panier" className="navbar-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                Panier {nombreArticles > 0 && `(${nombreArticles})`}
              </Link>
              {isAuthenticated() && (
                <Link to="/mon-compte" className="navbar-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  Mon Compte
                </Link>
              )}
              {isAuthenticated() ? (
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="navbar-mobile-btn">
                  Déconnexion
                </button>
              ) : (
                <Link to="/login" className="navbar-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  Connexion
                </Link>
              )}
            </div>

            <div className="navbar-dropdown" role="menu">
              {links.map(item => (
                <Link key={item.path} to={item.path} className="navbar-dropdown-link" role="menuitem" onClick={() => setMobileMenuOpen(false)}>
                  {item.title}
                </Link>
              ))}
              <Link to="/panier" className="navbar-dropdown-link" role="menuitem" onClick={() => setMobileMenuOpen(false)}>
                Panier {nombreArticles > 0 && `(${nombreArticles})`}
              </Link>
              {isAuthenticated() && (
                <Link to="/mon-compte" className="navbar-dropdown-link" role="menuitem" onClick={() => setMobileMenuOpen(false)}>
                  Mon Compte
                </Link>
              )}
              {isAuthenticated() ? (
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="navbar-dropdown-btn" role="menuitem">
                  Déconnexion
                </button>
              ) : (
                <Link to="/login" className="navbar-dropdown-link" role="menuitem" onClick={() => setMobileMenuOpen(false)}>
                  Connexion
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

