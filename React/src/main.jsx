/**
 * main.jsx — Point d'entrée de l'application React
 * - C'est ici que l'application React est montée dans le DOM (`createRoot`).
 * - `StrictMode` active des vérifications supplémentaires en dev pour détecter
 *   les effets secondaires non sécurisés.
 * - `setupConsoleFilter()` réduit le bruit console pendant le développement.
 */
import App from "./App.jsx";
import { createRoot } from "react-dom/client";
import { setupConsoleFilter } from "./utils/helpers.js";
import { StrictMode } from "react";
import "flowbite";
import "./css/variables.css";
import "./css/index.css";
import "./css/utilities.css";

setupConsoleFilter();
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
