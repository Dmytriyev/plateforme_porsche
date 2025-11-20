import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// Créer __dirname pour les modules ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
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
    // Modifier la variable d'environnement BACKEND_URL si nécessaire.
    proxy: {
      // liste des préfixes d'API utilisés par l'application
      "/voiture": {
        target: process.env.BACKEND_URL || "http://localhost:3000",
        changeOrigin: true,
      },
      "/accesoire": {
        target: process.env.BACKEND_URL || "http://localhost:3000",
        changeOrigin: true,
      },
      "/commande": {
        target: process.env.BACKEND_URL || "http://localhost:3000",
        changeOrigin: true,
      },
      "/model_porsche": {
        target: process.env.BACKEND_URL || "http://localhost:3000",
        changeOrigin: true,
      },
      "/photo_porsche": {
        target: process.env.BACKEND_URL || "http://localhost:3000",
        changeOrigin: true,
      },
      "/photo_voiture": {
        target: process.env.BACKEND_URL || "http://localhost:3000",
        changeOrigin: true,
      },
      "/auth": {
        target: process.env.BACKEND_URL || "http://localhost:3000",
        changeOrigin: true,
      },
      "/personnalisation": {
        target: process.env.BACKEND_URL || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
