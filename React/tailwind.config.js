/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        porsche: {
          black: '#000000',
          red: '#d5001c',
          gold: '#c0a062',
        },
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
};
