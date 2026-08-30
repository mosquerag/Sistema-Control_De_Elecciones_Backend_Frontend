const EmptyState = ({
  icon: Icon    = null,
  emoji         = null,
  title         = "No hay datos",
  description   = null,
  action        = null,
  className     = "",
  iconColor     = "text-gray-300",
}) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {/* Ícono o emoji */}
      {Icon && !emoji && (
        <Icon className={`w-16 h-16 mx-auto mb-4 ${iconColor}`} />
      )}
      {emoji && !Icon && (
        <div className="text-5xl mb-4">{emoji}</div>
      )}
      {emoji && Icon && (
        <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-600 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">{emoji}</span>
        </div>
      )}

      {/* Título */}
      <p className="text-blue-600 dark:text-blue-300 text-lg font-semibold mb-1">
        {title}
      </p>

      {/* Descripción */}
      {description && (
        <p className="text-blue-400 dark:text-blue-500 text-sm mt-1 mb-4">
          {description}
        </p>
      )}

      {/* Acción */}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;