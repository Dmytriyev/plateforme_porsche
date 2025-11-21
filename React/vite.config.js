import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// Créer __dirname pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables for the current mode (dev, production, etc.)
  const env = loadEnv(mode, process.cwd(), "");
  const BACKEND_URL =
    env.VITE_BACKEND_URL ||
    env.BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:3000";

  // Liste des préfixes d'API utilisés par l'application
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

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      open: true,
      // Proxy des routes API vers le backend de développement.
      proxy,
    },
    // Build optimisation: split vendor and large libs into separate chunks
    build: {
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
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
