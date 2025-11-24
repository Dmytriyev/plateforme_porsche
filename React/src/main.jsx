import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'flowbite';
import './css/variables.css';
import './css/index.css';
import './css/utilities.css';
import { setupConsoleFilter } from './utils/helpers.js';
import App from './App.jsx';

setupConsoleFilter();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
