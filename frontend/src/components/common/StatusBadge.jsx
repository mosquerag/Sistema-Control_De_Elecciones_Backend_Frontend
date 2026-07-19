

/**
 * ═══════════════════════════════════════════════════════════════════════
 * COMPONENTE: StatusBadge.jsx
 * DESCRIPCIÓN: Badge reutilizable con colores vibrantes en dark mode
 * ═══════════════════════════════════════════════════════════════════════
 */

const VARIANTS = {
  // ── Roles ─────────────────────────────────────
  admin: {
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-800 dark:text-red-300",
    ring: "ring-red-400/40",
    label: "Admin",
  },

  ciudadano: {
    bg: "bg-green-100 dark:bg-green-400/25",
    text: "text-green-800 dark:text-green-200",
    ring: "ring-green-400/40",
    label: "Ciudadano",
  },

  candidato: {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-800 dark:text-blue-300",
    ring: "ring-blue-400/40",
    label: "Candidato",
  },

  // ── Estado elección ───────────────────────────
  activa: {
    bg: "bg-green-100 dark:bg-green-400/25",
    text: "text-green-700 dark:text-green-200",
    ring: "ring-green-400/40",
    label: "Activa",
  },

  proxima: {
    bg: "bg-blue-100 dark:bg-blue-400/25",
    text: "text-blue-700 dark:text-blue-200",
    ring: "ring-blue-400/40",
    label: "Próxima",
  },

  finalizada: {
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-800 dark:text-red-300",
    ring: "ring-red-400/40",
    label: "Finalizada",
  },

  inactiva: {
    bg: "bg-gray-100 dark:bg-gray-500/20",
    text: "text-gray-700 dark:text-gray-200",
    ring: "ring-gray-400/30",
    label: "Inactiva",
  },

  // ── General ───────────────────────────────────
  activo: {
    bg: "bg-green-100 dark:bg-green-400/25",
    text: "text-green-800 dark:text-green-200",
    ring: "ring-green-400/40",
    label: "Activo",
  },

  inactivo: {
    bg: "bg-gray-100 dark:bg-gray-500/20",
    text: "text-gray-800 dark:text-gray-200",
    ring: "ring-gray-400/30",
    label: "Inactivo",
  },

  pendiente: {
    bg: "bg-yellow-100 dark:bg-yellow-400/25",
    text: "text-yellow-800 dark:text-yellow-200",
    ring: "ring-yellow-400/40",
    label: "Pendiente",
  },

  aprobado: {
    bg: "bg-green-100 dark:bg-green-400/25",
    text: "text-green-800 dark:text-green-200",
    ring: "ring-green-400/40",
    label: "Aprobado",
  },

  rechazado: {
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-800 dark:text-red-300",
    ring: "ring-red-400/40",
    label: "Rechazado",
  },

  // ── Estadísticas ──────────────────────────────
  activa_estadistica: {
    bg: "bg-green-100 dark:bg-green-400/25",
    text: "text-green-800 dark:text-green-200",
    ring: "ring-green-400/40",
    label: "Activa",
  },

  finalizada_estadistica: {
    bg: "bg-gray-100 dark:bg-gray-500/20",
    text: "text-gray-800 dark:text-gray-200",
    ring: "ring-gray-400/30",
    label: "Finalizada",
  },
};

const StatusBadge = ({
  status,
  trueLabel = "Activo",
  falseLabel = "Inactivo",
  className = "",
}) => {
  // ── Boolean ───────────────────────────────────
  if (typeof status === "boolean") {
    const variant = status ? VARIANTS.activo : VARIANTS.inactivo;

    return (
      <span
        className={`
          inline-flex items-center px-3 py-1 rounded-full
          text-xs font-semibold whitespace-nowrap
          ring-1 ${variant.ring}
          ${variant.bg} ${variant.text} ${className}
        `}
      >
        {status ? trueLabel : falseLabel}
      </span>
    );
  }

  // ── String ────────────────────────────────────
  const key = String(status).toLowerCase();

  const variant = VARIANTS[key] || {
    bg: "bg-gray-100 dark:bg-gray-500/20",
    text: "text-gray-800 dark:text-gray-200",
    ring: "ring-gray-400/30",
    label: status,
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full
        text-xs font-semibold whitespace-nowrap
        ring-1 ${variant.ring}
        ${variant.bg} ${variant.text} ${className}
      `}
    >
      {variant.label}
    </span>
  );
};

export default StatusBadge;
