import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROLES, ROUTES } from '@/utils/constants';
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold">
            🗳️ Sistema de Votaciones
          </Link>

          {/* Menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm">
                  Hola, <strong>{user?.nombre}</strong>
                </span>
                <span className="text-xs bg-white text-primary px-2 py-1 rounded">
                  {user?.rol}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-white text-primary px-4 py-2 rounded hover:bg-gray-100"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to={ROUTES.LOGIN_ADMIN}
                  className="px-4 py-2 rounded hover:bg-blue-600"
                >
                  Admin
                </Link>
                <Link
                  to={ROUTES.LOGIN_CIUDADANO}
                  className="px-4 py-2 rounded hover:bg-blue-600"
                >
                  Ciudadano
                </Link>
                <Link
                  to={ROUTES.LOGIN_CANDIDATO}
                  className="px-4 py-2 rounded hover:bg-blue-600"
                >
                  Candidato
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;