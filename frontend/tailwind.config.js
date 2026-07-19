/**
 * ARCHIVO: tailwind.config.js
 * UBICACIÓN: /frontend/tailwind.config.js
 *
 * CAMBIOS:
 * ✅ darkMode en modo 'class' (ya estaba bien)
 * ✅ Agregados tokens de diseño personalizados que complementan las variables CSS
 * ✅ Fuentes del sistema de diseño
 */

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Fuentes del sistema de diseño
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['Courier New', 'monospace'],
      },

      // Colores que mapean a las variables CSS (para poder usar en className)
      colors: {
        primary:   'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent:    'var(--color-accent)',
        base:      'var(--color-base)',
        surface:   'var(--color-surface)',
      },

      // Bordes redondeados del sistema de diseño
      borderRadius: {
        sm:  'var(--radius-sm)',
        md:  'var(--radius-md)',
        lg:  'var(--radius-lg)',
        xl:  'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },

      // Sombras del sistema de diseño
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },

      // Animaciones personalizadas
      animation: {
        'fade-in':     'fadeIn 0.3s ease forwards',
        'slide-right': 'slideInRight 0.3s ease forwards',
        'pulse-soft':  'pulseSoft 2s ease-in-out infinite',
        'spin-slow':   'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};