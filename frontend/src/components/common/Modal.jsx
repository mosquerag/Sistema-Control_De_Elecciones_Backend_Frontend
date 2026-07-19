
// const Modal = ({
//   isOpen,
//   onClose,
//   title,
//   children,
//   footer,
//   className,
//   bodyClassName,
// }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-slate-700 bg-opacity-50 flex items-center justify-center z-50">
//       <div
//         className={`
//           bg-white dark:bg-slate-900 backdrop-blur-lg
//           rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-y-auto
//           ${className || "max-h-[90vh]"}
//         `}
//       >
//         {/* Header */}
//         <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
//           <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
//             {title}
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl transition-colors"
//           >
//             ×
//           </button>
//         </div>

//         {/* Body */}
//         <div className={bodyClassName || "p-4"}>{children}</div>

//         {/* Footer */}
//         {footer && (
//           <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-slate-700">
//             {footer}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Modal;


import { useEffect, useRef } from "react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
  bodyClassName,
}) => {
  const modalRef = useRef(null);
  const previouslyFocused = useRef(null);

  // ── Cerrar con Escape + foco al abrir/cerrar ─────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement;
    modalRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }

      // Trampa de foco simple: mantener el Tab dentro del modal
      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Devolver el foco a donde estaba antes de abrir el modal
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-700 bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={`
          bg-white dark:bg-slate-900 backdrop-blur-lg
          rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-y-auto
          outline-none
          ${className || "max-h-[90vh]"}
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
          <h2
            id="modal-title"
            className="text-3xl font-bold text-gray-800 dark:text-white"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className={bodyClassName || "p-4"}>{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-slate-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;