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