/**
 * COMPONENTE: PageLayout.jsx
 * UBICACIÓN: /frontend/src/components/common/PageLayout.jsx
 * DESCRIPCIÓN: Layout reutilizable con Sidebar + TopBar para páginas internas
 * @param {Array}   menuItems       - Items del sidebar
 * @param {String}  activeSection   - Sección activa del sidebar
 * @param {String}  contentPadding  - Padding del contenido (default: "p-4 md:p-8")
 * @param {Boolean} fullHeight      - h-screen (true) o min-h-screen (false)
 * @param {ReactNode} children      - Contenido de la página
 */

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "@/hooks/useAuth";


const PageLayout = ({
  menuItems = [],
  activeSection = "home",
  contentPadding = "p-4 md:p-4",
  fullHeight = true,
  children,
}) => {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile]       = useState(false);
  const [currentSection, setCurrentSection] = useState(activeSection);

  // ── Responsive: detectar móvil y ajustar sidebar ─────────────────
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ── Datos del usuario para TopBar ────────────────────────────────
  const userData = {
    name:             user?.nombre || "Usuario",
    username:         user?.email?.split("@")[0] || "usuario",
    initials:
      user?.nombre
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "US",
    plan:             user?.rol === "admin" ? "Administrador" : "Premium",
    isOnline:         true,
    hasNotifications: false,
  };

  return (
    <div
      className={`flex flex-col md:flex-row ${
        fullHeight ? "h-screen" : "min-h-screen"
      } bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden`}
    >
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        isMobile={isMobile}
        activeSection={currentSection}
        onSectionChange={setCurrentSection}
        menuItems={menuItems}
      />

      {/* ── Contenido principal ─────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <TopBar
          userData={userData}
          isMobile={isMobile}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <div className={contentPadding}>{children}</div>
      </div>
    </div>
  );
};

export default PageLayout;