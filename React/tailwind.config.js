/** @type {import('tailwindcss').Config} */
// Fichier de configuration Tailwind CSS pour une application React.
import flowbitePlugin from "flowbite/plugin";

export default {
  // Chemins des fichiers à scanner pour les classes Tailwind.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
  ],
  // Extension du thème Tailwind avec des couleurs Porsche.
  theme: {
    extend: {
      colors: {
        porsche: {
          black: "#000000",
          red: "#d5001c",
          gold: "#c0a062",
        },
      },
    },
  },
  plugins: [flowbitePlugin],
};
