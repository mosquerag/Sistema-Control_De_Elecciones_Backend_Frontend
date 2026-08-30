
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-slate-800 hover:bg-slate-600 dark:bg-slate-500 dark:hover:bg-slate-400 text-white dark:text-gray-100",

  success:
    // "bg-green-600 hover:bg-green-500 dark:bg-green-700 dark:hover:bg-green-800 text-white",
    "bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-500 text-white",

  secondary:
    "bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white",

  info: "bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white",
  // info: "bg-blue-800 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white",

  accent:
    "bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white",

  outline:
    "bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-700 dark:hover:text-white",

  danger: "bg-red-600 hover:bg-red-700 text-white",

  warning:
    "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-500 text-white",

  ghost:
    "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed ",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2",
};

const Button = ({
  children,
  text,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  onClick,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200 ease-in-out
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${SIZES[size] || SIZES.md}
        ${VARIANTS[variant] || VARIANTS.primary}
        ${className}
      `
        .replace(/\s+/g, " ")
        .trim()}
      {...props}
    >
      {loading && (
        <Loader2
          className="w-4 h-4 animate-spin flex-shrink-0"
          aria-hidden="true"
        />
      )}
      {loading ? "Cargando..." : children || text}
    </button>
  );
};

export default Button;
