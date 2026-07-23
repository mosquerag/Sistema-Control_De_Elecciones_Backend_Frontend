/**
 * ═══════════════════════════════════════════════════════════════════════
 * COMPONENTE: ActionCard.jsx
 * UBICACIÓN: /frontend/src/components/common/ActionCard.jsx
 * DESCRIPCIÓN: Tarjeta de navegación/acción reutilizable
 * @param {String}    title        - Título de la tarjeta
 * @param {String}    description  - Descripción breve
 * @param {ReactNode} icon         - Ícono de lucide-react
 * @param {String}    route        - Ruta de navegación (usa Link)
 * @param {Function}  onClick      - Función alternativa a route (usa div)
 * @param {String}    gradient     - Clases del gradiente del ícono
 * @param {String}    bubbleColor  - Color de la burbuja decorativa
 * @param {String}    actionLabel  - Texto del enlace inferior (default: "Acceder")
 * @param {String}    className    - Clases adicionales
 */

import { Link } from "react-router-dom";

const ActionCard = ({
  title        = "",
  description  = "",
  icon         = null,
  route        = null,
  onClick      = null,
  gradient     = "from-blue-500 to-blue-600",
  bubbleColor  = "from-blue-400/20 to-blue-400/20",
  actionLabel  = "Acceder",
  className    = "",
}) => {
  const content = (
    <>
      {/* Burbuja decorativa */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32
          bg-gradient-to-br ${bubbleColor} rounded-full
          -mr-12 md:-mr-16 -mt-12 md:-mt-16
          group-hover:scale-150 transition-transform duration-500`}
      />

      {/* Contenido */}
      <div className="relative z-10">
        {/* Ícono */}
        <div
          className={`inline-flex p-3 md:p-4 rounded-xl
            bg-gradient-to-br ${gradient} text-white
            mb-3 md:mb-4
            group-hover:scale-110 group-hover:rotate-6
            transition-all duration-300`}
        >
          {icon}
        </div>

        {/* Título */}
        <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-2">
          {title}
        </h3>

        {/* Descripción */}
        <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm">
          {description}
        </p>

        {/* Enlace inferior */}
        <div
          className="mt-3 md:mt-4 flex items-center
            text-blue-600 dark:text-blue-500 font-medium text-sm
            group-hover:translate-x-2 transition-transform duration-300"
        >
          {actionLabel}
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </>
  );

  // const baseClasses = `
  //   group bg-white dark:bg-slate-800
  //   rounded-xl md:rounded-2xl p-5 md:p-6
  //   shadow-lg hover:shadow-2xl
  //   transition-all duration-300
  //   transform hover:-translate-y-2
  //   cursor-pointer relative overflow-hidden
  //   ${className}
  // `;

  const baseClasses = `
  group bg-blue-100 dark:bg-blue-900/70
  border border-blue-500
  rounded-xl md:rounded-2xl p-5 md:p-6
  shadow-lg hover:shadow-2xl
  transition-all duration-300
  transform hover:-translate-y-2
  cursor-pointer relative overflow-hidden
  ${className}
`;

  // Si tiene ruta → usar Link
  if (route) {
    return (
      <Link to={route} className={`block ${baseClasses}`}>
        {content}
      </Link>
    );
  }

  // Si tiene onClick → usar div
  return (
    <div onClick={onClick} className={baseClasses}>
      {content}
    </div>
  );
};

export default ActionCard;