/**
 * ARCHIVO: ProtectedRoute.jsx
 * UBICACIÓN: /frontend/src/router/ProtectedRoute.jsx  ← ÚNICA COPIA
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/common/Loader";

const DASHBOARD_ROUTES = {
  admin: "/admin/dashboard",
  ciudadano: "/ciudadano/dashboard",
  candidato: "/candidato/dashboard",
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <Loader fullScreen />;

  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.rol)) {
    return <Navigate to={DASHBOARD_ROUTES[user?.rol] || "/"} replace />;
  }

  // Con children → modo wrapper | Sin children → modo layout (Outlet)
  return children ?? <Outlet />;
};

export default ProtectedRoute;
