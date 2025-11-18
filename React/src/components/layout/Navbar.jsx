import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { usePanier } from '../../hooks/usePanier.jsx';
import './Navbar.css';

/**
 * Composant Navbar - Barre de navigation principale selon charte Porsche
 */
const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { nombreArticles } = usePanier();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-text">PORSCHE</span>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-gray-300 transition-colors font-medium">
              Accueil
            </Link>
            <Link to="/choix-voiture" className="hover:text-gray-300 transition-colors font-medium">
              Voitures
            </Link>
            <Link to="/accessoires" className="hover:text-gray-300 transition-colors font-medium">
              Accessoires
            </Link>

            {isAuthenticated() && (
              <Link to="/mon-compte" className="hover:text-gray-300 transition-colors font-medium">
                Mon Compte
              </Link>
            )}

            {isAdmin() && (
              <Link to="/admin" className="hover:text-gray-300 transition-colors font-medium text-red-400">
                Administration
              </Link>
            )}
          </div>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Panier */}
            <Link to="/panier" className="relative hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {nombreArticles > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {nombreArticles}
                </span>
              )}
            </Link>

            {/* Authentification */}
            {isAuthenticated() ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">Bonjour, {user?.prenom}</span>
                
                {/* Dashboard selon le rôle */}
                {isAdmin() && (
                  <Link to="/dashboard/admin" className="hover:text-gray-300 transition-colors font-medium">
                    Dashboard Admin
                  </Link>
                )}
                {(user?.role === 'conseillere' || isAdmin()) && (
                  <Link to="/dashboard/conseiller" className="hover:text-gray-300 transition-colors font-medium">
                    Dashboard Conseiller
                  </Link>
                )}
                
                {/* Liens utilisateur */}
                <Link to="/mes-voitures" className="hover:text-gray-300 transition-colors font-medium">
                  Mes Voitures
                </Link>
                <Link to="/mes-commandes" className="hover:text-gray-300 transition-colors font-medium">
                  Mes Commandes
                </Link>
                <Link to="/mon-compte" className="hover:text-gray-300 transition-colors font-medium">
                  Mon Compte
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 hover:text-gray-300 transition-colors font-medium"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Bouton Menu Mobile */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="hover:text-gray-300 transition-colors font-medium">
                Accueil
              </Link>
              <Link to="/voitures" className="hover:text-gray-300 transition-colors font-medium">
                Voitures
              </Link>
              <Link to="/accessoires" className="hover:text-gray-300 transition-colors font-medium">
                Accessoires
              </Link>
              <Link to="/panier" className="hover:text-gray-300 transition-colors font-medium flex items-center gap-2">
                Panier {nombreArticles > 0 && `(${nombreArticles})`}
              </Link>

              {isAuthenticated() ? (
                <>
                  {/* Dashboards selon le rôle */}
                  {isAdmin() && (
                    <Link to="/dashboard/admin" className="hover:text-gray-300 transition-colors font-medium text-blue-400">
                      Dashboard Admin
                    </Link>
                  )}
                  {(user?.role === 'conseillere' || isAdmin()) && (
                    <Link to="/dashboard/conseiller" className="hover:text-gray-300 transition-colors font-medium text-yellow-400">
                      Dashboard Conseiller
                    </Link>
                  )}
                  
                  {/* Liens utilisateur */}
                  <Link to="/mes-voitures" className="hover:text-gray-300 transition-colors font-medium">
                    Mes Voitures
                  </Link>
                  <Link to="/mes-reservations" className="hover:text-gray-300 transition-colors font-medium">
                    Mes Réservations
                  </Link>
                  <Link to="/mes-commandes" className="hover:text-gray-300 transition-colors font-medium">
                    Mes Commandes
                  </Link>
                  <Link to="/mon-compte" className="hover:text-gray-300 transition-colors font-medium">
                    Mon Compte
                  </Link>
                  <button
                    onClick={logout}
                    className="text-left hover:text-gray-300 transition-colors font-medium"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-gray-300 transition-colors font-medium">
                    Connexion
                  </Link>
                  <Link to="/register" className="hover:text-gray-300 transition-colors font-medium">
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

