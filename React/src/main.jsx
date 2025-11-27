/**
 * — Point d'entrée de l'application React
 * - C'est ici que l'application React est montée dans le DOM (`createRoot`).
 * - `StrictMode` active des vérifications supplémentaires en developpement.
 * - `setupConsoleFilter()` réduit le bruit console pendant le développement.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { setupConsoleFilter } from "./utils/helpers.js";
import App from "./App.jsx";
import "./css/index.css";
import "./css/utilities.css";
import "./css/variables.css";
import 'flowbite';

setupConsoleFilter();
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
