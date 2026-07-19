/**
 * ═══════════════════════════════════════════════════════════════════════
 * COMPONENTE: Avatar.jsx
 * UBICACIÓN: /frontend/src/components/common/Avatar.jsx
 * DESCRIPCIÓN: Avatar con foto o iniciales generadas automáticamente
 * @param {String}  nombre    - Nombre para generar iniciales
 * @param {String}  nombre    - Nombre para generar iniciales
 * @param {String}  foto      - URL de la foto (opcional)
 * @param {String}  size      - "xs" | "sm" | "md" | "lg" | "xl"
 * @param {String}  shape     - "circle" | "rounded" (rounded-2xl)
 * @param {String}  gradient  - Clases de gradiente de fondo (cuando no hay foto)
 * @param {String}  className - Clases adicionales
 */

const SIZES = {
  xs: { container: "w-8 h-8",   text: "text-xs" },
  sm: { container: "w-10 h-10", text: "text-sm" },
  md: { container: "w-16 h-16", text: "text-lg" },
  lg: { container: "w-20 h-20 md:w-24 md:h-24", text: "text-2xl md:text-3xl" },
  xl: { container: "w-28 h-28", text: "text-4xl" },
};

const getInitials = (nombre) => {
  if (!nombre) return "?";
  const palabras = nombre.trim().split(" ").filter(Boolean);
  if (palabras.length === 1) return palabras[0].charAt(0).toUpperCase();
  return (palabras[0].charAt(0) + palabras[1].charAt(0)).toUpperCase();
};

const Avatar = ({
  nombre      = "",
  foto        = null,
  size        = "md",
  shape       = "circle",
  gradient    = "from-blue-500 to-purple-600",
  className   = "",
}) => {
  const { container, text } = SIZES[size] || SIZES.md;
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-2xl";
  const base = `${container} ${shapeClass} flex-shrink-0 object-cover`;

  if (foto) {
    return (
      <img
        src={foto}
        alt={nombre}
        // className={`${base} border-2 border-gray-200 dark:border-gray-400 shadow-md ${className}`}
        className={`${base} border-2 border-green-400 dark:border-green-500 ${className}`}
        onError={(e) => {
          // Fallback: ocultar imagen y mostrar iniciales
          e.target.style.display = "none";
          e.target.nextElementSibling?.classList.remove("hidden");
        }}
      />
    );
  }

  return (
    <div
      className={`${container} ${shapeClass} bg-gradient-to-br ${gradient} flex items-center justify-center border-2 border-gray-200 dark:border-gray-400 shadow-md flex-shrink-0 ${className}`}
    >
      <span className={`text-white font-bold ${text}`}>
        {getInitials(nombre)}
      </span>
    </div>
  );
};

// Exportar también la función para uso externo
export { getInitials };
export default Avatar;