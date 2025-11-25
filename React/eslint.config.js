// - Utilisation de `defineConfig` pour une configuration claire et typée.
// - Inclusion de plugins pour React Hooks et React Refresh (Vite).
// - `globalIgnores` exclut les dossiers de build et dépendances.
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default defineConfig([
  // Configuration globale ESLint pour le projet React.
  globalIgnores(["dist", "node_modules", "build"]),
  {
    // Settings spécifiques aux fichiers de configuration JS.
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
    // Règles ESLint pour les fichiers JS/JSX de l'application React.
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    // Configuration des options de langage pour React.
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    // Règles personnalisées pour le projet React.
    rules: {
      "no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^[A-Z_]",
          caughtErrors: "none",
        },
      ],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
]);
