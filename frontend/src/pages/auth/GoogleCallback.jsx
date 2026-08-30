import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  extraerErrorDeURL,
  procesarCallbackGoogle,
  limpiarURLParametros,
} from "@/config/googleOAuth";
import Loader from "@/components/common/Loader";
import { mostrarAlerta } from "@/utils/alertas";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const manejarCallback = async () => {
      const errorInfo = extraerErrorDeURL();
      if (errorInfo) {
        mostrarAlerta("error", "Error de autenticación", errorInfo.message);
        navigate("/loginadmin", { replace: true });
        return;
      }

      try {
        const { usuario } = await procesarCallbackGoogle();
        login(usuario);
        limpiarURLParametros();

        mostrarAlerta(
          "success",
          `¡Bienvenido, ${usuario.nombre}!`,
          "Has iniciado sesión con Google",
        );
        navigate("/admin/dashboard", { replace: true });
      } catch (error) {
        mostrarAlerta(
          "error",
          "Error al iniciar sesión",
          error.message || "Error al procesar la autenticación con Google",
        );
        navigate("/loginadmin", { replace: true });
      }
    };

    manejarCallback();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center">
        <Loader size="lg" />
        <p className="mt-4 text-gray-700 dark:text-gray-300 text-lg font-medium">
          Procesando autenticación con Google...
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;