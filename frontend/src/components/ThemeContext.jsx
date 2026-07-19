

import { createContext, useContext, useEffect, useState } from "react";

// ── Contexto ─────────────────────────────────────────────────────────
const ThemeContext = createContext({
  isDark:      false,
  toggleTheme: () => {},
});

// ── Provider ─────────────────────────────────────────────────────────
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Leer preferencia guardada en localStorage
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    // Respetar preferencia del sistema operativo
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Aplicar clase "dark" al <html> y guardar en localStorage
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ── Hook ─────────────────────────────────────────────────────────────
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  }
  return context;
};

export default ThemeContext;