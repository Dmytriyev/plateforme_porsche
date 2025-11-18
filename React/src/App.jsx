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
import ChoixVoiture from './pages/ChoixVoiture.jsx';
import CatalogueModeles from './pages/CatalogueModeles.jsx';
import ListeVariantes from './pages/ListeVariantes.jsx';
import Voitures from './pages/Voitures.jsx';
import VoitureDetail from './pages/VoitureDetail.jsx';
import Configurateur from './pages/Configurateur.jsx';
import ConfigurationComplete from './pages/ConfigurationComplete.jsx';
import Accessoires from './pages/Accessoires.jsx';
import Panier from './pages/Panier.jsx';

// Pages protégées
import MonCompte from './pages/MonCompte.jsx';
import MesVoitures from './pages/MesVoitures.jsx';
import MesReservations from './pages/MesReservations.jsx';
import MesCommandes from './pages/MesCommandes.jsx';
import DashboardAdmin from './pages/DashboardAdmin.jsx';
import DashboardConseiller from './pages/DashboardConseiller.jsx';

import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PanierProvider>
          <BrowserRouter>
            <div className="app-container">
              {/* Navigation */}
              <Navbar />

              {/* Contenu principal */}
              <main className="app-main">
                <Routes>
                  {/* Routes publiques */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Parcours hiérarchique voitures */}
                  <Route path="/choix-voiture" element={<ChoixVoiture />} />
                  <Route path="/catalogue/:type" element={<CatalogueModeles />} />
                  <Route path="/variantes/:type/:modeleId" element={<ListeVariantes />} />
                  
                  {/* Ancien parcours (compatibilité) */}
            <Route path="/voitures" element={<Voitures />} />
            <Route path="/voitures/:id" element={<VoitureDetail />} />
          <Route path="/configurateur/:voitureId" element={<Configurateur />} />
          <Route path="/configuration/:varianteId" element={<ConfigurationComplete />} />
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
                  
                  <Route
                    path="/mes-voitures"
                    element={
                      <ProtectedRoute>
                        <MesVoitures />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/mes-reservations"
                    element={
                      <ProtectedRoute>
                        <MesReservations />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/mes-commandes"
                    element={
                      <ProtectedRoute>
                        <MesCommandes />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/dashboard/admin"
                    element={
                      <ProtectedRoute>
                        <DashboardAdmin />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/dashboard/conseiller"
                    element={
                      <ProtectedRoute>
                        <DashboardConseiller />
                      </ProtectedRoute>
                    }
                  />

                  {/* Route 404 */}
                  <Route
                    path="*"
                    element={
                      <div className="page-404">
                        <div className="page-404-content">
                          <h1 className="page-404-title">404</h1>
                          <p className="page-404-text">
                            Page non trouvée
                          </p>
                          <a
                            href="/"
                            className="page-404-link"
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
