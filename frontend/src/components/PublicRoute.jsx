import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './common/Loader';

const PublicRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  //Mientras verifica la autenticación, muestra loader
  if (loading) {
    return <Loader fullScreen />;
  }

  // YA está autenticado → redirigir a su dashboard
  if (isAuthenticated && user) {
    const dashboardRoutes = {
      'admin': '/admin/dashboard',
      'ciudadano': '/ciudadano/dashboard',
      'candidato': '/candidato/dashboard',
    };
    const userDashboard = dashboardRoutes[user.rol] || '/';
    return <Navigate to={userDashboard} replace />;
  }

  //  Si NO está autenticado → mostrar la página pública (login/registro)
  return children;
};

export default PublicRoute;