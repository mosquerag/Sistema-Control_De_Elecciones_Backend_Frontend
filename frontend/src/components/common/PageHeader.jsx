/**
 * COMPONENTE: PageHeader.jsx
 * UBICACIÓN: /frontend/src/components/common/PageHeader.jsx
 * DESCRIPCIÓN: Encabezado de página con título, descripción y acción opcional
 * @param {String}    title       - Título principal de la página
 * @param {String}    description - Descripción debajo del título (opcional)
 * @param {ReactNode} action      - Botón u elemento a la derecha (opcional)
 * @param {String}    className   - Clases adicionales del contenedor
 */

const PageHeader = ({
  title,
  description = null,
  action      = null,
  className   = "",
}) => {
  return (
    <div className={`flex justify-between items-center mb-3 ${className}`}>
    {/* <div className={`flex justify-between items-center mb-6 ${className}`}> */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;