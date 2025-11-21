import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'flowbite';
import './css/variables.css';
import './css/index.css';
import './css/utilities.css';
import './css/common.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
