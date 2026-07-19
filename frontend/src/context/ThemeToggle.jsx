


import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function ThemeToggle({ variant = 'pill' }) {
  const { isDark, toggleTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg transition-colors duration-200
                   hover:bg-slate-100 dark:hover:bg-slate-700"
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        title={isDark ? 'Modo claro' : 'Modo oscuro'}
      >
        {isDark
          ? <Sun  className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
          : <Moon className="w-5 h-5 md:w-6 md:h-6 text-slate-600" />
        }
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full
                 bg-white dark:bg-slate-700
                 border-2 border-slate-200 dark:border-slate-600
                 hover:bg-slate-100 dark:hover:bg-slate-600
                 transition-all duration-300 shadow-md"
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark
        ? <Sun  className="w-5 h-5 text-yellow-400" />
        : <Moon className="w-5 h-5 text-slate-700" />
      }
    </button>
  );
}