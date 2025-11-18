// Configuration ESLint pour le projet React quelles règles appliquer, quels fichiers analyser.
// pour lancer : npx eslint ou npm run lint .

import js from "@eslint/js"; // preset recommandé d'ESLint pour JS
import globals from "globals"; // liste de variables globales (browser/node/etc.)
import reactHooks from "eslint-plugin-react-hooks"; // règles pour les React Hooks
import reactRefresh from "eslint-plugin-react-refresh"; // règles liées à React Refresh / Vite
import { defineConfig, globalIgnores } from "eslint/config"; // utilitaires pour la config

export default defineConfig([
  // Ignorer le dossiers
  globalIgnores(["dist", "node_modules", "build"]),
  // Configuration pour les fichiers de config (tailwind, vite)
  {
    files: ["*.config.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-undef": "off",
    },
  },
  {
    // Cible les fichiers JS et JSX du projet
    files: ["**/*.{js,jsx}"],
    // Étend des configurations prêtes à l'emploi
    extends: [
      js.configs.recommended, // règles ESLint recommandées pour JS
      reactHooks.configs.flat.recommended, // vérifications spécifiques aux Hooks React
      reactRefresh.configs.vite, // règles utiles quand on utilise Vite + React Refresh
    ],
    languageOptions: {
      // Version ECMAScript par défaut pour certaines vérifications
      ecmaVersion: 2020,
      // Déclare que l'environnement cible est le navigateur
      globals: globals.browser,
      parserOptions: {
        // Utiliser les dernières fonctionnalités JS pour le parsing
        ecmaVersion: "latest",
        // Autoriser la syntaxe JSX
        ecmaFeatures: { jsx: true },
        // Le code utilise des modules ES
        sourceType: "module",
      },
    },
    // Règles personnalisées ou surcharges
    rules: {
      // Erreur si une variable n'est jamais utilisée, sauf si elle commence
      // par une majuscule, underscore, ou est "err/error" dans un catch
      "no-unused-vars": ["error", { 
        varsIgnorePattern: "^[A-Z_]",
        caughtErrors: "none"  // Ignore les variables dans catch
      }],
      // Désactiver react-refresh pour les contextes
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
]);
