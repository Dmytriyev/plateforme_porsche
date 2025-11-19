import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { PanierProvider } from './context/PanierContext.jsx';
import { Navbar, Footer } from './components/layout';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ChoixVoiture from './pages/ChoixVoiture.jsx';
import CatalogueModeles from './pages/CatalogueModeles.jsx';
import ListeVariantes from './pages/ListeVariantes.jsx';
import Voitures from './pages/Voitures.jsx';
import VoitureDetail from './pages/VoitureDetail.jsx';
import VoiturePage from './pages/VoiturePage.jsx';
import VariantePage from './pages/VariantePage.jsx';
import OccasionPage from './pages/OccasionPage.jsx';
import ToutesOccasions from './pages/ToutesOccasions.jsx';
import Configurateur from './pages/Configurateur.jsx';
import ConfigurationComplete from './pages/ConfigurationComplete.jsx';
import Accessoires from './pages/Accessoires.jsx';
import CategoriesAccessoires from './pages/CategoriesAccessoires.jsx';
import AccessoiresParCategorie from './pages/AccessoiresParCategorie.jsx';
import AccessoireDetail from './pages/AccessoireDetail.jsx';
import Panier from './pages/Panier.jsx';
import MonCompte from './pages/MonCompte.jsx';
import MesVoitures from './pages/MesVoitures.jsx';
import MesReservations from './pages/MesReservations.jsx';
import MesCommandes from './pages/MesCommandes.jsx';
import DashboardAdmin from './pages/DashboardAdmin.jsx';
import DashboardConseiller from './pages/DashboardConseiller.jsx';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <PanierProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <div className="app-container">
              <Navbar />
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/choix-voiture" element={<ChoixVoiture />} />
                  <Route path="/catalogue/:type" element={<CatalogueModeles />} />
                  <Route path="/variantes/:type/:modeleId" element={<ListeVariantes />} />
                  <Route path="/voiture-page/:id" element={<VoiturePage />} />
                  <Route path="/variante/:id" element={<VariantePage />} />
                  <Route path="/occasion/:id" element={<OccasionPage />} />
                  <Route path="/occasion" element={<OccasionPage />} />
                  <Route path="/toutes-occasions" element={<ToutesOccasions />} />
                  <Route path="/voitures" element={<Voitures />} />
                  <Route path="/voitures/:id" element={<VoitureDetail />} />
                  <Route path="/configurateur/:voitureId" element={<Configurateur />} />
                  <Route path="/configuration/:varianteId" element={<ConfigurationComplete />} />
                  <Route path="/accessoires-old" element={<Accessoires />} />
                  <Route path="/accessoires" element={<CategoriesAccessoires />} />
                  <Route path="/accessoires/categorie/:categorie" element={<AccessoiresParCategorie />} />
                  <Route path="/accessoires/detail/:id" element={<AccessoireDetail />} />
                  <Route path="/panier" element={<Panier />} />
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
                  <Route
                    path="*"
                    element={
                      <div className="page-404">
                        <div className="page-404-content">
                          <h1 className="page-404-title">404</h1>
                          <p className="page-404-text">Page non trouvée</p>
                          <a href="/" className="page-404-link">
                            Retour à l'accueil
                          </a>
                        </div>
                      </div>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </ErrorBoundary>
      </PanierProvider>
    </AuthProvider>
  );
}

export default App;
