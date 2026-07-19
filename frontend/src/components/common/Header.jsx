

import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Menu, X } from "lucide-react";
import { HashLink } from "react-router-hash-link";
import Button from "./Button.jsx";
import ThemeToggle from "../ThemeToggle"; // ✅ importa el componente, no useTheme
import MobileMenu from "./MobileMenu";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="bg-slate-100  dark:bg-slate-800
                       text-blue-900 dark:text-white
                       shadow-md sticky top-0 z-50
                       transition-all duration-300
                       border-b-2 border-slate-100 dark:border-slate-800"
    >
      <div className="flex justify-between items-center py-2 px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-8 h-8 text-blue-600  dark:text-blue-400" />
          <span className="text-2xl font-bold text-blue-900  dark:text-blue-300">
            VoteSecure
          </span>
        </div>

        {/* Navegación escritorio */}
        <nav className="hidden md:flex items-center space-x-4">
          <HashLink smooth to="/#inicio">
            <Button text="Inicio" className="!bg-slate-800 dark:!bg-blue-900 border border-blue-600 hover:bg-slate-300 dark:hover:bg-slate-700" />
          </HashLink>
          <HashLink smooth to="/#caracteristicas">
            <Button text="Características" className="!bg-slate-800 dark:!bg-blue-900 border border-blue-600 hover:bg-slate-300 dark:hover:bg-slate-700" />
          </HashLink>
          <HashLink smooth to="/#contacto">
            <Button text="Contacto" className="!bg-slate-800 dark:!bg-blue-900 border border-blue-600 hover:bg-slate-300 dark:hover:bg-slate-700" />
          </HashLink>
          <HashLink smooth to="/Registrarse">
            <Button text="Registrarse" className="!bg-slate-800 dark:!bg-blue-900 border border-blue-600 hover:bg-slate-300 dark:hover:bg-slate-700" />
          </HashLink>
          <Link to="/Iniciosesion">
            <Button text="Iniciar Sesión" className="!bg-slate-800 dark:!bg-blue-900 border border-blue-600 hover:bg-slate-300 dark:hover:bg-slate-700" />
          </Link>

          {/* variant="pill" por defecto — estilo del Header público */}
          <ThemeToggle />
        </nav>

        {/* Ícono menú móvil */}
        <div
          className="md:hidden text-blue-900 dark:text-blue-400 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </div>
      </div>

      <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </header>
  );
}

export default Header;
