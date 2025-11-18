/**
 * App.jsx - Composant racine de l'application
 * 
 * Structure:
 * - Providers (Auth, Panier)
 * - Router (BrowserRouter)
 * - Layout (Navbar, Footer)
 * - Routes (publiques et protégées)
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { PanierProvider } from './context/PanierContext.jsx';
import { Navbar, Footer } from './components/layout';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Pages publiques
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Voitures from './pages/Voitures.jsx';
import Accessoires from './pages/Accessoires.jsx';
import Panier from './pages/Panier.jsx';

// Pages protégées
import MonCompte from './pages/MonCompte.jsx';

import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PanierProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              {/* Navigation */}
              <Navbar />

            {/* Contenu principal */}
            <main className="flex-1">
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/voitures" element={<Voitures />} />
                <Route path="/accessoires" element={<Accessoires />} />
                <Route path="/panier" element={<Panier />} />

                {/* Routes protégées - Nécessitent authentification */}
                <Route
                  path="/mon-compte"
                  element={
                    <ProtectedRoute>
                      <MonCompte />
                    </ProtectedRoute>
                  }
                />

                {/* Route 404 */}
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <h1 className="text-6xl font-bold mb-4">404</h1>
                        <p className="text-xl text-gray-600 mb-6">
                          Page non trouvée
                        </p>
                        <a
                          href="/"
                          className="text-black font-semibold hover:underline"
                        >
                          Retour à l'accueil
                        </a>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </main>

              {/* Footer */}
              <Footer />
            </div>
          </BrowserRouter>
        </PanierProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
