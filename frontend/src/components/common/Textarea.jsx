
const Textarea = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  required,
  disabled,
  maxLength,
  error,
  className = '',
  ...props
}) => {
  const hasError = !!error;

  return (
    <div className="w-full">
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={hasError}
        aria-describedby={hasError && id ? `${id}-error` : undefined}
        className={`
          w-full px-4 py-2.5 text-sm rounded-xl border
          bg-white dark:bg-slate-800
          text-slate-800 dark:text-slate-100
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          resize-y min-h-[80px]
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:opacity-50 disabled:cursor-not-allowed
          ${hasError
            ? 'border-red-500 focus:ring-red-300 dark:focus:ring-red-800'
            : 'border-blue-300 dark:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-400'
          }
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        {...props}
      />

      {hasError && (
        <p
          id={id ? `${id}-error` : undefined}
          role="alert"
          className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
        >
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;
