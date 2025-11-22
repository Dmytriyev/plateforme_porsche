import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Navbar, Footer } from './components/layout';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ChoixVoiture from './pages/ChoixVoiture.jsx';
import CatalogueModeles from './pages/CatalogueModeles.jsx';
import ListeVariantes from './pages/ListeVariantes.jsx';
import VariantePage from './pages/VariantePage.jsx';
import OccasionPage from './pages/OccasionPage.jsx';
import Configurateur from './pages/Configurateur.jsx';
import Accessoires from './pages/Accessoires.jsx';
import AccessoireDetail from './pages/AccessoireDetail.jsx';
import AjouterAccessoire from './pages/AjouterAccessoire.jsx';
import ModifierAccessoire from './pages/ModifierAccessoire.jsx';
import Panier from './pages/Panier.jsx';
import MonCompte from './pages/MonCompte.jsx';
import MesVoitures from './pages/MesVoitures.jsx';
import MaVoitureDetail from './pages/MaVoitureDetail.jsx';
import ModifierMaVoiture from './pages/ModifierMaVoiture.jsx';
import AjouterMaVoiture from './pages/AjouterMaVoiture.jsx';
import AjouterModelPorsche from './pages/AjouterModelPorsche.jsx';
import ModifierModelPorsche from './pages/ModifierModelPorsche.jsx';
import MesCommandes from './pages/MesCommandes.jsx';
import { routes, protectedRoutes } from './routes/index.js';
import './css/App.css';

const components = {
  Home, Login, Register, ChoixVoiture, CatalogueModeles, ListeVariantes,
  VariantePage, OccasionPage, Configurateur, Accessoires, AccessoireDetail,
  AjouterAccessoire, ModifierAccessoire, Panier, MonCompte, MesVoitures,
  MaVoitureDetail, ModifierMaVoiture, AjouterMaVoiture, AjouterModelPorsche,
  ModifierModelPorsche, MesCommandes,
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <div className="app-container">
            <Navbar />
            <main className="app-main">
              <Routes>
                {routes.map(({ path, elementName }) => {
                  const Component = components[elementName];
                  return <Route key={path} path={path} element={<Component />} />;
                })}
                {protectedRoutes.map(({ path, elementName, roles }) => {
                  const Component = components[elementName];
                  return (
                    <Route
                      key={path}
                      path={path}
                      element={<ProtectedRoute roles={roles}><Component /></ProtectedRoute>}
                    />
                  );
                })}
                <Route
                  path="*"
                  element={
                    <div className="page-404">
                      <div className="page-404-content">
                        <h1 className="page-404-title">404</h1>
                        <p className="page-404-text">Page non trouvée</p>
                        <Link to="/" className="page-404-link">Retour à l'accueil</Link>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
