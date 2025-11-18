import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { usePanier } from '../../hooks/usePanier.jsx';

/**
 * Composant Navbar - Barre de navigation principale
 */
const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { nombreArticles } = usePanier();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-black text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-3xl font-bold tracking-wider">PORSCHE</span>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-gray-300 transition-colors font-medium">
              Accueil
            </Link>
            <Link to="/voitures" className="hover:text-gray-300 transition-colors font-medium">
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
                  <Link to="/mon-compte" className="hover:text-gray-300 transition-colors font-medium">
                    Mon Compte
                  </Link>
                  {isAdmin() && (
                    <Link to="/admin" className="hover:text-gray-300 transition-colors font-medium text-red-400">
                      Administration
                    </Link>
                  )}
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

