/**
 * COMPONENTE: Input.jsx
 * UBICACIÓN: /frontend/src/components/common/Input.jsx
 * DESCRIPCIÓN: Componente de campo de entrada reutilizable con soporte para íconos, validación y estilos personalizados
 * @param {Object} param0 
 * @returns 
 */

const Input = ({
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  disabled,
  maxLength,
  error,
  icon,
  iconRight,
  className = "",
  ...props
}) => {
  const hasError = !!error;

  return (
    <div className="relative w-full">
      {/* Icono izquierdo */}
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
          {icon}
        </span>
      )}

      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={hasError}
        aria-describedby={hasError && id ? `${id}-error` : undefined}
        className={`
          w-full py-2.5 text-sm font-sans
          bg-white dark:bg-slate-800
          text-slate-800 dark:text-slate-100
          border  rounded-xl
          placeholder:text-slate-400 dark:placeholder:text-slate-400
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:opacity-50 disabled:cursor-not-allowed
          ${icon ? "pl-10" : "pl-4"}
          ${iconRight ? "pr-10" : "pr-4"}
          ${
            hasError
              ? "border-red-500 focus:ring-red-300 dark:focus:ring-red-800"
              // : "border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900"
              :"border-blue-300 dark:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-400"

          }
          ${className}
        `
          .replace(/\s+/g, " ")
          .trim()}
        {...props}
      />

      {/* Icono derecho */}
      {iconRight && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
          {iconRight}
        </span>
      )}

      {/* Mensaje de error */}
      {hasError && (
        <p
          id={id ? `${id}-error` : undefined}
          role="alert"
          className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
