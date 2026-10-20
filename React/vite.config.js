// Fichier de configuration Vite pour une application React
// - `server.proxy` redirige les appels d'API en dev vers le backend (évite CORS en dev).
// - `manualChunks` permet d'isoler les dépendances lourdes (React, UI, Stripe)
import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "url";
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Créer __dirname pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement selon le mode
  const env = loadEnv(mode, process.cwd(), "");
  const BACKEND_URL = env.VITE_API_URL;

  // Liste des préfixes d'API utilisés par l'application React.
  const apiPrefixes = [
    "/voiture",
    "/accesoire",
    "/commande",
    "/model_porsche",
    "/photo_porsche",
    "/photo_voiture",
    "/auth",
    "/personnalisation",
  ];

  // Crée l'objet `proxy` de façon concise en mappant les préfixes.
  const proxy = Object.fromEntries(
    apiPrefixes.map((prefix) => [
      prefix,
      {
        target: BACKEND_URL,
        changeOrigin: true,
        // `secure: false` utile pour les certificats self-signed en HTTPS dev.
        secure: BACKEND_URL.startsWith("https://") ? false : true,
      },
    ])
  );

  // Configuration principale de Vite pour React.
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Configuration du serveur de développement Vite
    server: {
      port: 5173,
      open: true,
      // Proxy des routes API vers le backend de développement.
      proxy,
    },
    // Configuration de build avec optimisation
    build: {
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          // Séparation des dépendances en chunks distincts pour optimiser le caching.
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react") || id.includes("react-dom"))
                return "react-vendor";
              if (id.includes("flowbite") || id.includes("tailwindcss"))
                return "ui-vendor";
              if (id.includes("@stripe") || id.includes("stripe"))
                return "stripe-vendor";
              return "vendor";
            }
          },
        },
      },
    },
  };
});
