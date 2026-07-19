import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

// ── Páginas públicas ───────────────────────────────────────
import Home from "@/pages/home";
import InicioSesion from "@/pages/auth/InicioSesion";
import RegisterSesion from "@/pages/auth/RegisterSesion";
import LoginAdmin from "@/pages/auth/LoginAdmin";
import LoginCiudadano from "@/pages/auth/LoginCiudadano";
import LoginCandidato from "@/pages/auth/LoginCandidato";
import RegisterAdmin from "@/pages/auth/RegisterAdmin";
import RegisterCiudadano from "@/pages/auth/RegisterCiudadano";
import RegisterCandidato from "@/pages/auth/RegisterCandidato";
import RegisterAdministrador from "@/pages/auth/RegisterAdministrador";
import GoogleCallback from "@/pages/auth/GoogleCallback";

// ── Páginas Admin ──────────────────────────────────────────
import DashboardAdmin from "@/pages/admin/DashboardAdmin";
import GestionElecciones from "@/pages/admin/GestionElecciones";
import GestionCandidatos from "@/pages/admin/GestionCandidatos";
import GestionUsuarios from "@/pages/admin/GestionUsuarios";
import GestionTiposEleccion from "@/pages/admin/GestionTiposEleccion";
import EstadisticasAdmin from "@/pages/admin/EstadisticasAdmin";
import EleccionListTotal from "@/pages/admin/EleccionListTotal";
import GestionCiudadanos from "@/pages/admin/GestionCiudadanos";
// import GestionAdministradores from "@/pages/admin/GestionAdministradores";
import GestionAdmin from "@/pages/admin/GestionAdmin";


// ── Páginas Ciudadano ──────────────────────────────────────
import DashboardCiudadano from "@/pages/ciudadano/DashboardCiudadano";
import EleccionesActivas from "@/pages/ciudadano/EleccionesActivas";
import VerCandidatos from "@/pages/ciudadano/VerCandidatos";
import Votar from "@/pages/ciudadano/Votar";
import HistorialVotos from "@/pages/ciudadano/HistorialVotos";
import ResultadosPublicos from "@/pages/ciudadano/ResultadosPublicos";
import ListaResultados from "@/pages/ciudadano/ListaResultados";

// ── Páginas Candidato ──────────────────────────────────────
import DashboardCandidato from "@/pages/candidato/DashboardCandidato";
import MisResultados from "@/pages/candidato/MisResultados";

// ── Layouts ────────────────────────────────────────────────
import AdminLayout from "@/layouts/AdminLayout";
import CiudadanoLayout from "@/layouts/CiudadanoLayout";
import CandidatoLayout from "@/layouts/CandidatoLayout";

// - Cambio de contraseña ----------------------------------------
import ForgotPassword from '@/pages/auth/ForgotPassword';

const AppRouter = () => {
  return (
    <Routes>
      {/* ═══════════════════════════════════════════════════
          RUTAS PÚBLICAS
      ═══════════════════════════════════════════════════ */}
      <Route path="/" element={<Home />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />

      <Route
        path="/iniciosesion"
        element={
          <PublicRoute>
            <InicioSesion />
          </PublicRoute>
        }
      />
      <Route
        path="/registrarse"
        element={
          <PublicRoute>
            <RegisterSesion />
          </PublicRoute>
        }
      />
      <Route
        path="/loginadmin"
        element={
          <PublicRoute>
            <LoginAdmin />
          </PublicRoute>
        }
      />
      <Route
        path="/loginciudadano"
        element={
          <PublicRoute>
            <LoginCiudadano />
          </PublicRoute>
        }
      />
      <Route
        path="/logincandidato"
        element={
          <PublicRoute>
            <LoginCandidato />
          </PublicRoute>
        }
      />
      <Route
        path="/registeradmin"
        element={
          <PublicRoute>
            <RegisterAdmin />
          </PublicRoute>
        }
      />
      <Route
        path="/registeradministrador"
        element={
          <PublicRoute>
            <RegisterAdministrador />
          </PublicRoute>
        }
      />
      <Route
        path="/registerciudadano"
        element={
          <PublicRoute>
            <RegisterCiudadano />
          </PublicRoute>
        }
      />
      <Route
        path="/registercandidato"
        element={
          <PublicRoute>
            <RegisterCandidato />
          </PublicRoute>
        }
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />


      {/* ═══════════════════════════════════════════════════
          RUTAS ADMIN
          ProtectedRoute verifica rol,
          AdminLayout provee Sidebar + TopBar,
          Outlet renderiza la página hija
      ═══════════════════════════════════════════════════ */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<DashboardAdmin />} />
        <Route
          path="/admin/tipos-eleccion"
          element={<GestionTiposEleccion />}
        />
        <Route path="/admin/elecciones" element={<GestionElecciones />} />
        <Route path="/admin/candidatos" element={<GestionCandidatos />} />
        <Route path="/admin/usuarios" element={<GestionUsuarios />} />
        <Route path="/admin/ciudadanos" element={<GestionCiudadanos />} />
        <Route path="/admin/estadisticas" element={<EstadisticasAdmin />} />
        <Route path="/admin/administradores" element={<GestionAdmin />} />
        <Route
          path="/admin/estadisticas/:idEleccion"
          element={<EstadisticasAdmin />}
        />
        <Route
          path="/admin/estadisticas-total"
          element={<EleccionListTotal />}
        />
      </Route>



      {/* ═══════════════════════════════════════════════════
          RUTAS CIUDADANO
      ═══════════════════════════════════════════════════ */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["ciudadano"]}>
            <CiudadanoLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/ciudadano/dashboard" element={<DashboardCiudadano />} />
        <Route path="/ciudadano/elecciones" element={<EleccionesActivas />} />
        <Route path="/ciudadano/historial" element={<HistorialVotos />} />
        <Route
          path="/ciudadano/resultados-publicos"
          element={<ListaResultados />}
        />
        <Route
          path="/ciudadano/resultados/:idEleccion"
          element={<ResultadosPublicos />}
        />
        <Route
          path="/ciudadano/candidatos/:idEleccion"
          element={<VerCandidatos />}
        />
        <Route path="/ciudadano/votar/:idEleccion" element={<Votar />} />
      </Route>

      {/* ═══════════════════════════════════════════════════
          RUTAS CANDIDATO
      ═══════════════════════════════════════════════════ */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["candidato"]}>
            <CandidatoLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/candidato/dashboard" element={<DashboardCandidato />} />
        <Route path="/candidato/resultados" element={<MisResultados />} />
      </Route>

      {/* ═══════════════════════════════════════════════════
          404
      ═══════════════════════════════════════════════════ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
