/**
 * ARCHIVO: GoogleCallback.jsx
 * UBICACIÓN: /frontend/src/pages/auth/GoogleCallback.jsx
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  extraerTokensDeURL,
  procesarCallbackGoogle,
  limpiarURLParametros,
} from "@/config/googleOAuth";
import Loader from "@/components/common/Loader";
import { mostrarAlerta } from "@/utils/alertas";

const DASHBOARD_ROUTES = {
  admin: "/admin/dashboard",
  ciudadano: "/ciudadano/dashboard",
  candidato: "/candidato/dashboard",
};

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const manejarCallback = async () => {
      try {
        const resultado = extraerTokensDeURL();

        // Sin tokens en URL → verificar sesión existente
        if (!resultado?.token && !resultado?.error) {
          const existingToken = localStorage.getItem("token");
          const existingUser = localStorage.getItem("user");

          if (existingToken && existingUser) {
            const user = JSON.parse(existingUser);
            navigate(DASHBOARD_ROUTES[user.rol] || "/", { replace: true });
            return;
          }

          navigate("/iniciosesion", { replace: true });
          return;
        }

        // Error en OAuth
        if (resultado?.error) {
          mostrarAlerta(
            "error",
            "Error de autenticación",
            resultado.message ||
              "No se pudo completar el inicio de sesión con Google",
          );
          navigate("/iniciosesion", { replace: true });
          return;
        }

        // Sin token
        if (!resultado?.token) {
          mostrarAlerta(
            "error",
            "Error",
            "No se recibió información de autenticación",
          );
          navigate("/iniciosesion", { replace: true });
          return;
        }

        // Procesar tokens
        const { usuario, token } = await procesarCallbackGoogle(
          resultado.token,
          resultado.refreshToken,
        );

        login(usuario, token);
        limpiarURLParametros();

        mostrarAlerta(
          "success",
          `¡Bienvenido, ${usuario.nombre}!`,
          "Has iniciado sesión con Google",
        );
        navigate(DASHBOARD_ROUTES[usuario.rol] || "/", { replace: true });
      } catch (error) {
        mostrarAlerta(
          "error",
          "Error al iniciar sesión",
          error.message || "Error al procesar la autenticación con Google",
        );
        navigate("/iniciosesion", { replace: true });
      }
    };

    manejarCallback();
  }, [navigate, login]);

  return (
    <div
      className="min-h-screen flex items-center justify-center
                    bg-gradient-to-br from-blue-50 to-indigo-100
                    dark:from-slate-900 dark:to-slate-800"
    >
      <div className="text-center">
        <Loader size="lg" />
        <p className="mt-4 text-gray-700 dark:text-gray-300 text-lg font-medium">
          Procesando autenticación con Google...
        </p>
        <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
          Por favor espera un momento
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;
