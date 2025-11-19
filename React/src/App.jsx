import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { PanierProvider } from './context/PanierContext.jsx';
import { Navbar, Footer } from './components/layout';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Loading from './components/common/Loading.jsx';
import './App.css';

// Lazy loaded pages to improve initial bundle size
const Home = lazy(() => import('./pages/Home.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const ChoixVoiture = lazy(() => import('./pages/ChoixVoiture.jsx'));
const CatalogueModeles = lazy(() => import('./pages/CatalogueModeles.jsx'));
const ListeVariantes = lazy(() => import('./pages/ListeVariantes.jsx'));
const Voitures = lazy(() => import('./pages/Voitures.jsx'));
const VoitureDetail = lazy(() => import('./pages/VoitureDetail.jsx'));
const VoiturePage = lazy(() => import('./pages/VoiturePage.jsx'));
const VariantePage = lazy(() => import('./pages/VariantePage.jsx'));
const OccasionPage = lazy(() => import('./pages/OccasionPage.jsx'));
const ToutesOccasions = lazy(() => import('./pages/ToutesOccasions.jsx'));
const Configurateur = lazy(() => import('./pages/Configurateur.jsx'));
const ConfigurationComplete = lazy(() => import('./pages/ConfigurationComplete.jsx'));
const Accessoires = lazy(() => import('./pages/Accessoires.jsx'));
const CategoriesAccessoires = lazy(() => import('./pages/CategoriesAccessoires.jsx'));
const AccessoiresParCategorie = lazy(() => import('./pages/AccessoiresParCategorie.jsx'));
const AccessoireDetail = lazy(() => import('./pages/AccessoireDetail.jsx'));
const Panier = lazy(() => import('./pages/Panier.jsx'));
const MonCompte = lazy(() => import('./pages/MonCompte.jsx'));
const MesVoitures = lazy(() => import('./pages/MesVoitures.jsx'));
const MesReservations = lazy(() => import('./pages/MesReservations.jsx'));
const MesCommandes = lazy(() => import('./pages/MesCommandes.jsx'));
const AjouterPorsche = lazy(() => import('./pages/AjouterPorsche.jsx'));
const AjouterVoitureOccasion = lazy(() => import('./pages/AjouterVoitureOccasion.jsx'));
const DemandeContact = lazy(() => import('./pages/DemandeContact.jsx'));
const DashboardAdmin = lazy(() => import('./pages/DashboardAdmin.jsx'));
const DashboardConseiller = lazy(() => import('./pages/DashboardConseiller.jsx'));

const routes = [
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/choix-voiture', element: <ChoixVoiture /> },
  { path: '/catalogue/:type', element: <CatalogueModeles /> },
  { path: '/variantes/:type/:modeleId', element: <ListeVariantes /> },
  { path: '/voiture-page/:id', element: <VoiturePage /> },
  { path: '/variante/:id', element: <VariantePage /> },
  { path: '/occasion/:id?', element: <OccasionPage /> },
  { path: '/toutes-occasions', element: <ToutesOccasions /> },
  { path: '/voitures', element: <Voitures /> },
  { path: '/voitures/:id', element: <VoitureDetail /> },
  { path: '/configurateur/:voitureId', element: <Configurateur /> },
  { path: '/configuration/:varianteId', element: <ConfigurationComplete /> },
  { path: '/accessoires', element: <Accessoires /> },
  { path: '/accessoires/categories', element: <CategoriesAccessoires /> },
  { path: '/accessoires/categorie/:categorie', element: <AccessoiresParCategorie /> },
  { path: '/accessoires/detail/:id', element: <AccessoireDetail /> },
  { path: '/panier', element: <Panier /> },
  { path: '/demande-contact', element: <DemandeContact /> },
];

const protectedRoutes = [
  { path: '/mon-compte', element: <MonCompte /> },
  { path: '/mes-voitures', element: <MesVoitures /> },
  { path: '/mes-reservations', element: <MesReservations /> },
  { path: '/mes-commandes', element: <MesCommandes /> },
  { path: '/ajouter-porsche', element: <AjouterPorsche /> },
  { path: '/ajouter-voiture-occasion', element: <AjouterVoitureOccasion /> },
  { path: '/dashboard/admin', element: <DashboardAdmin /> },
  { path: '/dashboard/conseiller', element: <DashboardConseiller /> },
];

function App() {
  return (
    <AuthProvider>
      <PanierProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <div className="app-container">
              <Navbar />
              <main className="app-main">
                <Suspense fallback={<Loading />}>
                  <Routes>
                    {routes.map((r) => (
                      <Route key={r.path} path={r.path} element={r.element} />
                    ))}

                    {protectedRoutes.map((r) => (
                      <Route
                        key={r.path}
                        path={r.path}
                        element={
                          <ProtectedRoute>
                            {r.element}
                          </ProtectedRoute>
                        }
                      />
                    ))}

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
                </Suspense>
              </main>
              <Footer />
            </div>
          </ErrorBoundary>
        </BrowserRouter>
      </PanierProvider>
    </AuthProvider>
  );
}

export default App;
