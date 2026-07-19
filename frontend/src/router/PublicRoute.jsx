/**
 * ARCHIVO: PublicRoute.jsx
 * UBICACIÓN: /frontend/src/router/PublicRoute.jsx  ← ÚNICA COPIA
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Loader from '@/components/common/Loader';

const DASHBOARD_ROUTES = {
  admin:     '/admin/dashboard',
  ciudadano: '/ciudadano/dashboard',
  candidato: '/candidato/dashboard',
};

const PublicRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <Loader fullScreen />;

  if (isAuthenticated && user) {
    return <Navigate to={DASHBOARD_ROUTES[user.rol] || '/'} replace />;
  }

  return children;
};

export default PublicRoute;