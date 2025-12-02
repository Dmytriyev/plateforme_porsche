// Configuration ESLint 9 pour React + Vite
// - Utilisation du format flat config (ESLint 9+)
// - Plugins pour React Hooks et React Refresh
// - Ignores globaux pour dist, node_modules, build
import globals from "globals";
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";

export default [
  // Ignorer les dossiers de build et dépendances
  {
    ignores: ["dist/**", "node_modules/**", "build/**"],
  },
  // Configuration pour les fichiers de config (*.config.js)
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
  // Configuration principale pour les fichiers JS/JSX de l'application
  {
    files: ["**/*.{js,jsx}"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      react,
    },
    settings: {
      react: {
        version: "detect", // Détecte automatiquement la version de React
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // Règles React essentielles
      "react/jsx-uses-react": "off", // Pas besoin avec React 17+
      "react/react-in-jsx-scope": "off", // Pas besoin avec React 17+
      "react/jsx-uses-vars": "error",
      "react/prop-types": "off", // Optionnel si vous utilisez TypeScript ou pas de PropTypes

      // Gestion des variables non utilisées
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],

      // React Refresh (HMR)
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // Bonnes pratiques (Code Quality)
      "no-console": ["warn", { allow: ["warn", "error"] }], // Éviter console.log en production
      "prefer-const": "error", // Utiliser const quand c'est possible
      "no-var": "error", // Interdire var, utiliser let/const
    },
  },
];
