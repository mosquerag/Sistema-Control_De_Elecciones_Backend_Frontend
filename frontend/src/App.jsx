/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: App.jsx
 * UBICACIÓN: /frontend/src/App.jsx
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CAMBIOS:
 *  Eliminado import './App.css' — el archivo está vacío y genera
 *    una advertencia de módulo sin usar en producción
 */

import { useLocation } from "react-router-dom";
import AppRouter from "@/router/AppRouter";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

// Rutas donde se muestra el Header y Footer públicos
const PUBLIC_LAYOUT_PATHS = ["/"];

function App() {
  const { pathname } = useLocation();
  const isPublicLayout = PUBLIC_LAYOUT_PATHS.includes(pathname);

  return (
    <>
      {isPublicLayout && <Header />}
      <AppRouter />
      {isPublicLayout && <Footer />}
    </>
  );
}

export default App;
