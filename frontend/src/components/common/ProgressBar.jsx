const SIZES = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

const ProgressBar = ({
  label      = "",
  value      = 0,
  total      = 100,
  percentage = null,
  color      = "from-blue-500 to-purple-600",
  trackColor = "bg-gray-200 dark:bg-slate-700",
  showLabel  = true,
  showValue  = true,
  size       = "md",
  className  = "",
}) => {
  // Calcular porcentaje
  const pct =
    percentage !== null
      ? Math.min(100, Math.max(0, percentage))
      : total > 0
        ? Math.min(100, Math.max(0, Math.round((value / total) * 100)))
        : 0;

  const barHeight = SIZES[size] || SIZES.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Etiqueta izquierda */}
      {showLabel && label && (
        <span className="text-sm text-gray-600 dark:text-gray-400 w-32 truncate flex-shrink-0">
          {label}
        </span>
      )}

      {/* Barra */}
      <div className={`flex-1 ${trackColor} rounded-full ${barHeight} overflow-hidden`}>
        <div
          className={`bg-gradient-to-r ${color} ${barHeight} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Porcentaje derecho */}
      {showValue && (
        <span className="text-sm font-bold text-gray-800 dark:text-white w-12 text-right flex-shrink-0">
          {pct}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;