import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // ESSENTIEL : Utiliser l'hôte 0.0.0.0 pour l'accessibilité Docker
    host: '0.0.0.0',
    // ESSENTIEL : Changer le port par défaut (5173) au port 3000 attendu par devcontainer.json
    port: 3000, 
    // Optionnel: Ouvrir le navigateur automatiquement
    open: true
  }
});