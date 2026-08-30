/**
 * ARCHIVO: vite.config.js
 * UBICACIÓN: /frontend/vite.config.js
 *
 * CAMBIOS:
 * ✅ Eliminado código comentado (versión anterior)
 * ✅ Solo un plugin de React (react-swc, el activo)
 * ✅ Alias @ correctamente configurado
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Alerta si algún chunk supera 500KB
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Separar vendor chunks para mejor caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui:     ['sweetalert2', 'react-toastify', 'lucide-react'],
        },
      },
    },
  },
});