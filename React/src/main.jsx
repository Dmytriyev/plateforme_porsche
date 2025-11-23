import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'flowbite';
import './css/variables.css';
import './css/index.css';
import './css/utilities.css';
import './css/common.css';
import App from './App.jsx';

// Filtrer les avertissements Stripe dans la console en développement
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    // Ignorer les avertissements Stripe spécifiques
    if (
      message.includes('preload') ||
      message.includes('passive event listener') ||
      message.includes('scroll-blocking')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    // Ignorer les erreurs Stripe non critiques et erreurs d'extensions Chrome
    if (
      message.includes('preload') ||
      message.includes('passive event listener') ||
      message.includes('runtime.lastError') ||
      message.includes('back/forward cache') ||
      message.includes('extension port')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
