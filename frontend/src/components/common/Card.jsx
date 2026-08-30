
const VARIANTS = {
  default:
    "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm",
  elevated:
    "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg",
  flat: "bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600",
  bordered:
    "bg-white dark:bg-slate-800 border-2 border-[#314e6e] dark:border-blue-400",

};

const Card = ({
  children,
  className = "",
  variant = "default",
  noHover = false,
  title,
  icon,
  items,
  ...props
}) => {
  const hoverClass = noHover
    ? ""
    : "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200";

  if (title || items) {
    return (
      <div
        className={`
          rounded-2xl p-6
          ${VARIANTS[variant] || VARIANTS.default}
          ${hoverClass}
          ${className}
        `
          .replace(/\s+/g, " ")
          .trim()}
        {...props}
      >
        {(title || icon) && (
          <div className="flex items-center gap-2 mb-4">
            {icon}
            {title && (
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {title}
              </h3>
            )}
          </div>
        )}
        {items && (
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
              >
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#314e6e] dark:bg-blue-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
        {children}
      </div>
    );
  }

  return (
    <div
      className={`
        rounded-2xl p-6
        ${VARIANTS[variant] || VARIANTS.default}
        ${hoverClass}
        ${className}
      `
        .replace(/\s+/g, " ")
        .trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
