import { Navigate } from "react-router-dom";
// import { useAuth } from "../../hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import Loader from "./Loader";
/**
 * 🔒 ProtectedRoute
 *
 * Componente que protege rutas privadas
 *
 * FUNCIONALIDADES:
 * - Si no está autenticado → redirige a /
 * - Si está autenticado pero no tiene el rol correcto → redirige a su dashboard
 * - Si intenta volver con URL después de cerrar sesión → redirige a /
 *
 * @param {ReactNode} children - Componente a proteger
 * @param {Array} allowedRoles - Roles permitidos (ej: ['admin', 'ciudadano'])
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // // 🔄 Mientras verifica la autenticación, muestra loader
  // if (loading) {
  //   return <Loader />;
  // }

  if (loading) {
    return <Loader fullScreen />; // ✅ Usar fullScreen
  }

  // Si NO está autenticado → lo manda al inicio
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si está autenticado pero NO tiene el rol correcto
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.rol)) {
    // Lo redirige a SU dashboard correcto según su rol
    const dashboardRoutes = {
      admin: "/admin/dashboard",
      ciudadano: "/ciudadano/dashboard",
      candidato: "/candidato/dashboard",
    };
    const userDashboard = dashboardRoutes[user?.rol] || "/";
    return <Navigate to={userDashboard} replace />;
  }

  // ✅ Si está autenticado Y tiene el rol correcto → muestra la página
  return children;
};

export default ProtectedRoute;
