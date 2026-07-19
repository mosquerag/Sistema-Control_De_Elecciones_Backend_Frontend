

const Select = ({
  id,
  name,
  value,
  onChange,
  options = [],
  required,
  disabled,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
        className={`
          w-full px-4 py-2.5 text-sm rounded-xl border
          bg-white dark:bg-slate-800
          text-slate-800 dark:text-slate-100
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            error
              ? "border-red-500 focus:ring-red-300 dark:focus:ring-red-800"
              : "border-blue-300 dark:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-400"
          }
          ${className}
        `
          .replace(/\s+/g, " ")
          .trim()}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <p
          role="alert"
          className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
        >
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  );
};

export default Select;
