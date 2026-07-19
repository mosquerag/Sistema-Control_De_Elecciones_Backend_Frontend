

import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export function Sidebar({
  isOpen,
  onToggle,
  isMobile,
  activeSection,
  onSectionChange,
  menuItems,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const getSectionActiva = (item) => {
    if (item.route) return location.pathname === item.route;
    return activeSection === item.id;
  };

  return (
    <>
      {/* Overlay móvil */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-slate-500/40 dark:bg-black/50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isMobile ? "fixed top-0 left-0 h-full z-50" : "relative"}
          ${isOpen ? "w-64" : "w-0 md:w-20"}
          transition-all duration-300 ease-in-out
          overflow-hidden shadow-2xl
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
        `}
      >
        {/* Header */}
        <div className="p-4 md:p-2 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
          {isOpen && (
            <h2 className="font-bold text-lg text-blue-700 dark:text-slate-200">
              Menú
            </h2>
          )}
          <button
            onClick={onToggle}
            aria-label="Toggle menu"
            className="p-2 rounded-lg text-blue-700 dark:text-slate-300 hover:bg-slate-400 dark:hover:bg-slate-700 transition-all duration-200 ml-auto"
          >
            {isOpen ? (
              <X className="w-5 h-5 md:w-6 md:h-6" />
            ) : (
              <Menu className="w-5 h-5 md:w-6 md:h-6e" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="px-2 md:px-3 space-y-1 mt-3">
          {menuItems.map((item) => {
            const isActive = getSectionActiva(item);
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  if (item.route) navigate(item.route);
                  if (isMobile) onToggle();
                }}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl transition-all duration-200 relative",
                  isActive
                    ? "bg-blue-600 hover:bg-blue-500 text-white dark:bg-blue-800 dark:hover:bg-blue-800 dark:text-slate-100"
                    : "bg-transparent text-blue-900 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-slate-900 dark:hover:text-white",
                ].join(" ")}
              >
                <span className="flex-shrink-0 text-current">{item.icon}</span>

                {isOpen && (
                  // <span className="font-medium text-sm md:text-base truncate text-current">
                  <span className="font-medium text-sm md:text-[15px] truncate text-current">
                    {item.label}
                  </span>
                )}

                {!isOpen && isActive && (
                  <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white dark:bg-blue-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
