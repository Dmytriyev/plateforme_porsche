/**
 * main.jsx - Point d'entrée de l'application React
 * Ce fichier initialise le rendu et monte l'application dans le DOM
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'flowbite';
import './styles/variables.css';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
