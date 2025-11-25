//— Composant racine de l'application React
import AccessoireDetail from "./pages/AccessoireDetail.jsx";
import Accessoires from "./pages/Accessoires.jsx";
import AjouterAccessoire from "./pages/AjouterAccessoire.jsx";
import AjouterMaVoiture from "./pages/AjouterMaVoiture.jsx";
import AjouterModelPorsche from "./pages/AjouterModelPorsche.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setNavigate } from "./utils/navigate.js";
import ToastifyProvider from "./components/ToastifyProvider.jsx";
import notify from "./utils/notify.js";
import CatalogueModeles from "./pages/CatalogueModeles.jsx";
import Checkout from "./pages/Checkout.jsx";
import ChoixVoiture from "./pages/ChoixVoiture.jsx";
import Configurateur from "./pages/Configurateur.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Footer from "./components/layout/Footer.jsx";
import Home from "./pages/Home.jsx";
import ListeVariantes from "./pages/ListeVariantes.jsx";
import Login from "./pages/Login.jsx";
import MaVoitureDetail from "./pages/MaVoitureDetail.jsx";
import MesCommandes from "./pages/MesCommandes.jsx";
import MesVoitures from "./pages/MesVoitures.jsx";
import ModifierAccessoire from "./pages/ModifierAccessoire.jsx";
import ModifierMaVoiture from "./pages/ModifierMaVoiture.jsx";
import ModifierModelPorsche from "./pages/ModifierModelPorsche.jsx";
import ModifierMonCompte from "./pages/ModifierMonCompte.jsx";
import MonCompte from "./pages/MonCompte.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import OccasionPage from "./pages/OccasionPage.jsx";
import Panier from "./pages/Panier.jsx";
import PaymentCancel from "./pages/PaymentCancel.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Register from "./pages/Register.jsx";
import { routes, protectedRoutes } from "./routes/index.js";
import VariantePage from "./pages/VariantePage.jsx";
import "./css/App.css";

const components = {
  AccessoireDetail,
  Accessoires,
  AjouterAccessoire,
  AjouterMaVoiture,
  AjouterModelPorsche,
  CatalogueModeles,
  Checkout,
  ChoixVoiture,
  Configurateur,
  Home,
  ListeVariantes,
  Login,
  MaVoitureDetail,
  MesCommandes,
  MesVoitures,
  ModifierAccessoire,
  ModifierMaVoiture,
  ModifierModelPorsche,
  ModifierMonCompte,
  MonCompte,
  OccasionPage,
  Panier,
  PaymentCancel,
  PaymentSuccess,
  Register,
  VariantePage,
};

function App() {
  return (
    // Fournit le contexte d'authentification à l'application
    <AuthProvider>
      {/*Gère la navigation entre les pages  */}
      <BrowserRouter>
        {/* Hook pour exposer `navigate` aux utilitaires non-React (ex: api client) */}
        <RouterBridge />
        <ToastifyProvider />
        {/*  Capture les erreurs dans l'arborescence des composants */}
        <ErrorBoundary>
          <div className="app-container">
            <Navbar />{/* Barre de navigation en haut de la page */}
            <main className="app-main">
              <Routes>{/* Définit les routes de l'application */}
                {routes.map(({ path, elementName }) => {
                  const Component = components[elementName];
                  return (
                    <Route
                      key={path}
                      path={path}
                      element={
                        Component ? (
                          <Component />
                        ) : (
                          <div className="page-missing-component">
                            <h2>Composant introuvable</h2>
                            <p>Le composant &quot;{elementName}&quot; est introuvable.</p>
                          </div>
                        )
                      }
                    />
                  );
                })}
                {protectedRoutes.map(({ path, elementName, roles }) => {
                  const Component = components[elementName];
                  return (
                    // Route protégée par rôle d'utilisateur
                    <Route
                      key={path}
                      path={path}
                      element={
                        Component ? (
                          <ProtectedRoute roles={roles}>
                            <Component />
                          </ProtectedRoute>
                        ) : (
                          <div className="page-missing-component">
                            <h2>Composant introuvable</h2>
                            <p>Le composant &quot;{elementName}&quot; est introuvable.</p>
                          </div>
                        )
                      }
                    />
                  );
                })}
                {/* Route pour les pages non trouvées (404) */}
                <Route
                  path="*"
                  element={
                    <div className="page-404">
                      <div className="page-404-content">
                        <h1 className="page-404-title">404</h1>
                        <p className="page-404-text">Page non trouvée</p>
                        <Link to="/" className="page-404-link">
                          Retour à l'accueil
                        </Link>
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

function RouterBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);

    // écouteur pour notifications provenant d'autres utilitaires (fallback)
    const handler = (e) => {
      try {
        const { message, type = "error" } = e.detail || {};
        if (message) notify.show(message, { type });
      } catch (err) {
        console.warn("notification error", err);
      }
    };
    window.addEventListener("app:notify", handler);
    return () => window.removeEventListener("app:notify", handler);
  }, [navigate]);

  return null;
}
