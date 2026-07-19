/**
 * ═══════════════════════════════════════════════════════════════════════
 * COMPONENTE: BackButton.jsx
 * UBICACIÓN: /frontend/src/components/common/BackButton.jsx
 * DESCRIPCIÓN: Botón "Volver" reutilizable con opción de ruta personalizada o navegación hacia atrás
 *
 * @param {String}   to       - Ruta destino. Si no se pasa, usa navigate(-1)
 * @param {String}   label    - Texto del botón (default: "Volver")
 * @param {String}   className - Clases adicionales
 */

import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

const BackButton = ({
  to        = null,
  label     = "Volver",
  className = "",
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="primary"
      onClick={handleClick}
      className={`flex items-center gap-2 transition-colors !bg-blue-800 dark:!bg-blue-600 ${className}`}
      // className={`flex items-center gap-2 text-gray-600 hover:text-gray-100 dark:text-gray-300 dark:hover:text-white transition-colors ${className}`}
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </Button>
  );
};

export default BackButton;