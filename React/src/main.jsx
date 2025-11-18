// Main.jsx Ce fichier est exécuté en premier quand l'application démarre. Il initialise le rendu et appelle tout le reste à partir de App.

// Il active des vérifications supplémentaires en développement pour aider à identifier les problèmes potentiels dans l'application.
import { StrictMode } from 'react'
// createRoot est la nouvelle API pour créer et gérer la racine de l'application React.
import { createRoot } from 'react-dom/client'
import 'flowbite';
import 'tw-elements';
// Global CSS import
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
