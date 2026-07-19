/**
 * ARCHIVO: InicioSesion.jsx
 * UBICACIÓN: /frontend/src/pages/auth/InicioSesion.jsx
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/common/Button";
import ThemeToggle from "@/components/ThemeToggle";

const DASHBOARD_ROUTES = {
  admin: "/admin/dashboard",
  ciudadano: "/ciudadano/dashboard",
  candidato: "/candidato/dashboard",
};

const USER_TYPES = [
  {
    id: "admin",
    title: "Administrador",
    icon: "👨‍💼",
    description: "Gestión del sistema electoral",
    route: "/loginadmin",
  },
  {
    id: "ciudadano",
    title: "Ciudadano",
    icon: "👤",
    description: "Ejercer tu derecho al voto",
    route: "/loginciudadano",
  },
  {
    id: "candidato",
    title: "Candidato",
    icon: "🎖️",
    description: "Acceso a tu campaña",
    route: "/logincandidato",
  },
];

const InicioSesion = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(DASHBOARD_ROUTES[user.rol] || "/", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center
                    px-4 py-10
                    bg-gradient-to-br from-blue-100 to-indigo-200
                    dark:from-blue-900 dark:to-slate-800"
    >
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-blue-600 dark:text-blue-400">
          🗳️ Sistema de Votaciones
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Transparencia, Seguridad y Democracia Digital para Todos
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
        {USER_TYPES.map((type) => (
          <div
            key={type.id}
            className="bg-white dark:bg-slate-900/95
                       border border-blue-500 dark:border-blue-400
                       rounded-2xl shadow-md p-6
                       hover:shadow-xl hover:-translate-y-1
                       transition-all duration-300"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">{type.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                {type.title}
              </h3>
              <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                {type.description}
              </p>
              <Button
                onClick={() => navigate(type.route)}
                variant="primary"
                className="w-full !bg-blue-950 dark:!bg-blue-800"
              >
                Iniciar Sesión
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        ¿No tienes cuenta?{" "}
        <button
          onClick={() => navigate("/registrarse")}
          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
        >
          Regístrate aquí
        </button>
      </p>
    </div>
  );
};

export default InicioSesion;
