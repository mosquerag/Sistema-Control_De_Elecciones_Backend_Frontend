import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import Button from "./Button.jsx";
import ThemeToggle from "../ThemeToggle.jsx";

export default function MobileMenu({ menuOpen, setMenuOpen }) {
  if (!menuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-100/10 dark:bg-slate-900/20 backdrop-blur-md flex flex-col px-6 py-6 md:hidden">

      {/* ── Header con X ── */}
      <div className="flex justify-end mb-8">
        <button
          onClick={() => setMenuOpen(false)}
          className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-blue-600 dark:text-blue-200" />
        </button>
      </div>

      {/* ── Navegación ── */}
      <nav className="flex flex-col space-y-3 flex-1">
        <HashLink smooth to="/#inicio" onClick={() => setMenuOpen(false)}>
          <Button text="Inicio" className="w-full !bg-slate-800 dark:!bg-blue-900 border border-blue-600 hover:bg-slate-300 dark:hover:bg-slate-700" />
        </HashLink>

        <HashLink smooth to="/#caracteristicas" onClick={() => setMenuOpen(false)}>
          <Button text="Características" className="w-full !bg-slate-800 dark:!bg-blue-900 border border-blue-600 hover:bg-slate-300 dark:hover:bg-slate-700" />
        </HashLink>

        <HashLink smooth to="/#contacto" onClick={() => setMenuOpen(false)}>
          <Button text="Contacto" className="w-full !bg-slate-800 dark:!bg-blue-900 border border-blue-600 hover:bg-slate-300 dark:hover:bg-slate-700" />
        </HashLink>

        <HashLink smooth to="/#registrarse" onClick={() => setMenuOpen(false)}>
          <Button text="Registrarse" className="w-full !bg-slate-800 dark:!bg-blue-900 border border-blue-600 hover:bg-slate-300 dark:hover:bg-slate-700" />
        </HashLink>

        <Link to="/Iniciosesion" onClick={() => setMenuOpen(false)}>
          <Button text="Iniciar Sesión" className="w-full !bg-slate-800 dark:!bg-blue-900 border border-blue-600 hover:bg-slate-300 dark:hover:bg-slate-700" />
        </Link>
      </nav>

      {/* ── Toggle tema ── */}
      <div className="flex justify-center pb-4">
        <ThemeToggle />
      </div>

    </div>
  );
}