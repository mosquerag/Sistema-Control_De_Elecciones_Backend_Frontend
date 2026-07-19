/**
 * ARCHIVO: RegisterSesion.jsx
 * UBICACIÓN: /frontend/src/pages/auth/RegisterSesion.jsx
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/common/Button";
import ThemeToggle from "@/components/ThemeToggle";

const RegisterSesion = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated && user) {
    const dashboardRoutes = {
      admin: "/admin/dashboard",
      ciudadano: "/ciudadano/dashboard",
      candidato: "/candidato/dashboard",
    };
    navigate(dashboardRoutes[user.rol] || "/", { replace: true });
    return null;
  }

  const userTypes = [
    {
      id: "admin",
      title: "Administrador",
      icon: "👨‍💼",
      description: "Registro de administradores",
      route: "/registeradmin",
    },
    {
      id: "ciudadano",
      title: "Ciudadano",
      icon: "👤",
      description: "Regístrate para votar",
      route: "/registerciudadano",
    },
    {
      id: "candidato",
      title: "Candidato",
      icon: "🎖️",
      description: "Postúlate a una elección",
      route: "/registercandidato",
    },
  ];

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
        {/* <h1 className="text-5xl md:text-6xl font-bold mb-4 text-blue-600">
         */}
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-blue-600 dark:text-blue-400">
          🗳️ Registro - Sistema de Votaciones
        </h1>
        {/* <p className="text-2xl text-gray-700 dark:text-gray-300"> */}
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Selecciona tu tipo de usuario para registrarte
        </p>
      </div>

      {/* <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full"> */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
        {userTypes.map((userType) => (
          <div
            key={userType.id}
            // className="bg-white border-2 border-gray-200 dark:bg-slate-800 dark:border-gray-600 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            className="bg-white dark:bg-slate-900/95
                       border border-blue-500 dark:border-blue-400
                       rounded-2xl shadow-md p-6
                       hover:shadow-xl hover:-translate-y-1
                       transition-all duration-300"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">{userType.icon}</div>
              {/* <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-200"> */}
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                {userType.title}
              </h3>
              <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
                {userType.description}
              </p>
              <Button
                onClick={() => navigate(userType.route)}
                // variant="primary"
                className="w-full !bg-blue-950 dark:!bg-blue-800"
              >
                Registrarse
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* <div className="mt-8 text-center"> */}
      <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        ¿Ya tienes cuenta?{" "}
        <button
          onClick={() => navigate("/iniciosesion")}
          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
        >
          Inicia sesión aquí
        </button>
      </p>
      {/* </div> */}
    </div>
  );
};

export default RegisterSesion;
