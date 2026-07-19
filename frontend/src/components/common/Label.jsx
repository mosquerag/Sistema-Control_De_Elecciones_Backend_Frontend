
/**
 * ARCHIVO: Label.jsx
 * UBICACIÓN: /frontend/src/components/common/Label.jsx
 */

const Label = ({ htmlFor, children, className = '', ...props }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-slate-800 dark:text-slate-100 mb-1 ${className}`}
    {...props}
  >
    {children}
  </label>
);

export default Label;