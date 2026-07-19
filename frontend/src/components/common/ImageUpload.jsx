/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: ImageUpload.jsx
 * UBICACIÓN: /frontend/src/components/common/ImageUpload.jsx
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Componente reutilizable para subir y previsualizar imágenes de perfil.
 *
 * PROPS:
 *  - name         (string)   nombre del campo (para handleChange)
 *  - value        (string)   base64 o URL actual de la imagen
 *  - onChange     (fn)       recibe el evento sintético o { name, value }
 *  - disabled     (bool)     deshabilita el botón
 *  - label        (string)   etiqueta visible (default: "Foto de perfil")
 *  - required     (bool)     muestra el asterisco rojo
 *  - maxSizeMB    (number)   tamaño máximo en MB (default: 5)
 *  - accept       (string)   tipos aceptados (default: imagen/*)
 *  - onError      (fn)       callback(mensaje) cuando hay error de validación
 *  - shape        (string)   "circle" | "square" (default: "circle")
 *  - size         (string)   "sm" | "md" | "lg"  (default: "md")
 */

import { useRef } from "react";

const SIZES = {
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

const VALID_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export default function ImageUpload({
  name = "foto",
  value = "",
  onChange,
  disabled = false,
  label = "Foto de perfil",
  required = false,
  maxSizeMB = 5,
  accept = "image/jpeg,image/jpg,image/png,image/gif,image/webp",
  onError,
  shape = "circle",
  size = "md",
}) {
  const inputRef = useRef(null);

  const radiusClass = shape === "circle" ? "rounded-full" : "rounded-xl";
  const sizeClass = SIZES[size] || SIZES.md;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!VALID_TYPES.includes(file.type)) {
      onError?.("Solo se permiten imágenes JPG, PNG, GIF o WEBP");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      onError?.(`La imagen no debe superar ${maxSizeMB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // Dispara onChange con un evento sintético compatible con handleChange genérico
      onChange?.({
        target: {
          name,
          type: "file",
          value: reader.result,
          files: e.target.files,
          // base64 directo para quien prefiera usarlo así
          _base64: reader.result,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="flex items-center gap-3 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3">
        {/* ── Avatar / Preview ── */}
        <div className="relative flex-shrink-0">
          {value ? (
            <>
              <img
                src={value}
                alt="Preview"
                className={`${sizeClass} ${radiusClass} object-cover border-2 border-green-400`}
              />
              {/* Checkmark badge */}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </>
          ) : (
            <div
              className={`${sizeClass} ${radiusClass} border-2 border-dashed border-blue-800 dark:border-blue-400 bg-blue-200 dark:bg-blue-900 flex items-center justify-center`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-gray-400"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
          )}
        </div>

        {/* ── Info + Botón ── */}
        <div className="flex-1 min-w-0">
          <p className="text-xs mb-1.5">
            {value ? (
              <span className="text-green-600 dark:text-green-400 font-medium">
                Imagen seleccionada ✓
              </span>
            ) : (
              <span className="text-blue-800 dark:text-blue-400">
                JPG, PNG, WEBP — máx. {maxSizeMB}MB
              </span>
            )}
          </p>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              ${
                value
                  ? "border-gray-200 text-gray-600 bg-white hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
                  : "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:text-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
              }`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {value ? "Cambiar imagen" : "Subir imagen"}
          </button>

          {/* Input oculto real */}
          <input
            ref={inputRef}
            id={name}
            name={name}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}