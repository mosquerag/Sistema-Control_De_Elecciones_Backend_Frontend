/**
 * COMPONENTE: Loader.jsx
 * UBICACIÓN: /frontend/src/components/common/Loader.jsx
 * DESCRIPCIÓN: Componente de carga reutilizable con opción de pantalla completa y mensaje personalizado
 */
import { Loader2 } from "lucide-react";

const Loader = ({ fullScreen = false, size = "md", mensaje = "" }) => {
  const SIZES = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const spinner = (
    <div
      className="flex flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
    >
      <Loader2
        // className={`${SIZES[size] || SIZES.md} text-[#314e6e] dark:text-blue-400 animate-spin`}
        className={`${SIZES[size] || SIZES.md} text-slate-700 dark:text-blue-400 animate-spin`}
        aria-hidden="true"
      />
      {mensaje && (
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          {mensaje}
        </p>
      )}
      <span className="sr-only">Cargando...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{spinner}</div>;
};

export default Loader;
