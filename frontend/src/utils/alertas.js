/**
 * ARCHIVO: alertas.js
 * UBICACIÓN: /frontend/src/utils/alertas.js
 * DESCRIPCIÓN: Sistema centralizado de alertas y notificaciones
 */

import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "sweetalert2/dist/sweetalert2.min.css";


// ── Detectar tema ─────────────────────────────────────────────────────
const isDark = () => document.documentElement.classList.contains("dark");

const getSwalTheme = () =>
  isDark()
    ? {
        popup: "!bg-slate-800 !text-white !rounded-2xl !shadow-2xl",
        title: "!text-white !text-xl !font-bold",
        htmlContainer: "!text-slate-300",
        confirmButton:
          "!bg-blue-600 hover:!bg-blue-500 !text-white !font-semibold !px-5 !py-2 !rounded-xl !mr-2",
        cancelButton:
          "!bg-transparent !border-2 !border-slate-500 !text-slate-300 !font-semibold !px-5 !py-2 !rounded-xl",
        timerProgressBar: "!bg-blue-400",
      }
    : {
        popup: "!rounded-2xl !shadow-2xl",
        title: "!text-gray-800 !text-xl !font-bold",
        htmlContainer: "!text-gray-600",
        confirmButton:
          "!bg-blue-700 hover:!bg-blue-600 !text-white !font-semibold !px-5 !py-2 !rounded-xl !mr-2",
        cancelButton:
          "!bg-transparent !border-2 !border-gray-300 !text-gray-600 !font-semibold !px-5 !py-2 !rounded-xl",
        timerProgressBar: "!bg-blue-600",
      };

const getConfirmGreen = () =>
  isDark()
    ? "!bg-green-600 hover:!bg-green-500 !text-white !font-semibold !px-5 !py-2 !rounded-xl !mr-2"
    : "!bg-green-600 hover:!bg-green-700 !text-white !font-semibold !px-5 !py-2 !rounded-xl !mr-2";

const getConfirmRed = () =>
  isDark()
    ? "!bg-red-600 hover:!bg-red-500 !text-white !font-semibold !px-5 !py-2 !rounded-xl !mr-2"
    : "!bg-red-600 hover:!bg-red-700 !text-white !font-semibold !px-5 !py-2 !rounded-xl !mr-2";

// ═══════════════════════════════════════════════════════════════════════
// TOASTS (notificaciones rápidas)
// ═══════════════════════════════════════════════════════════════════════

export const toastExito = (msg) =>
  toast.success(msg, { position: "top-right", autoClose: 3000 });
export const toastError = (msg) =>
  toast.error(msg, { position: "top-right", autoClose: 4000 });
export const toastInfo = (msg) =>
  toast.info(msg, { position: "top-right", autoClose: 3000 });
export const toastAdvertencia = (msg) =>
  toast.warning(msg, { position: "top-right", autoClose: 3500 });

// ═══════════════════════════════════════════════════════════════════════
// ALERTAS MODALES
// ═══════════════════════════════════════════════════════════════════════

export const mostrarAlerta = (icono, titulo, mensaje = "", timer = null) => {
  const iconoNormalizado =
    typeof icono === "string" ? icono.toLowerCase() : "info";
  const iconosValidos = ["success", "error", "warning", "info", "question"];
  const iconoFinal = iconosValidos.includes(iconoNormalizado)
    ? iconoNormalizado
    : "info";

  const tiempoAutomatico =
    timer !== null
      ? timer
      : iconoFinal === "success" || iconoFinal === "info"
        ? 2500
        : undefined;

  return Swal.fire({
    title: titulo,
    text: mensaje,
    icon: iconoFinal,
    timer: tiempoAutomatico,
    timerProgressBar: !!tiempoAutomatico,
    showConfirmButton: !tiempoAutomatico,
    confirmButtonText: "Aceptar",
    customClass: getSwalTheme(),
    buttonsStyling: false,
  });
};

// ═══════════════════════════════════════════════════════════════════════
// CONFIRMACIONES
// ═══════════════════════════════════════════════════════════════════════

export const confirmarAccion = (titulo, mensaje, onConfirm) => {
  const theme = getSwalTheme();
  return Swal.fire({
    title: titulo,
    text: mensaje,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
    customClass: { ...theme, confirmButton: getConfirmGreen() },
    buttonsStyling: false,
  }).then((res) => {
    if (res.isConfirmed && onConfirm) {
      onConfirm();
      return true;
    }
    return false;
  });
};

export const confirmarEliminacion = (titulo, mensaje, onConfirm) => {
  const theme = getSwalTheme();
  return Swal.fire({
    title: titulo,
    text: mensaje,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    customClass: { ...theme, confirmButton: getConfirmRed() },
    buttonsStyling: false,
  }).then((res) => {
    if (res.isConfirmed && onConfirm) {
      onConfirm();
      return true;
    }
    return false;
  });
};

export const confirmarLogout = (onConfirm) => {
  const theme = getSwalTheme();
  return Swal.fire({
    title: "¿Cerrar sesión?",
    text: "¿Estás seguro de que deseas cerrar sesión?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, salir",
    cancelButtonText: "Cancelar",
    customClass: { ...theme, confirmButton: getConfirmRed() },
    buttonsStyling: false,
  }).then((res) => {
    if (res.isConfirmed && onConfirm) {
      onConfirm();
      return true;
    }
    return false;
  });
};

// ═══════════════════════════════════════════════════════════════════════
// MANEJO DE ERRORES DE API
// ═══════════════════════════════════════════════════════════════════════

/**
 * Extrae el mensaje de error de la respuesta de la API y muestra un toast
 * No expone detalles técnicos al usuario
 */
export const manejarErrorApi = (
  error,
  mensajeFallback = "Ocurrió un error inesperado",
) => {
  const mensaje =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    mensajeFallback;

  // No mostrar mensajes de error técnicos al usuario en producción
  const mensajeSeguro = import.meta.env.PROD ? mensajeFallback : mensaje;

  toastError(mensajeSeguro);
};

// ═══════════════════════════════════════════════════════════════════════
// ALERTA PERFIL PENDIENTE
// ═══════════════════════════════════════════════════════════════════════

export const alertaPerfilPendiente = (rol) => {
  const theme = getSwalTheme();

  const mensajesPorRol = {
    admin:
      "Tu cuenta fue creada por un administrador. Por favor cambia tu contraseña temporal y completa tu información de perfil.",
    ciudadano:
      "Tu cuenta fue creada por un administrador. Por favor completa tu información de perfil.",
    candidato:
      "Tu cuenta fue creada por un administrador. Por favor completa tu información de perfil.",
  };

  return Swal.fire({
    icon: "warning",
    title: "⚠️ Perfil Incompleto",
    text: mensajesPorRol[rol] || "Debes completar tu información de perfil.",
    confirmButtonText: "Completar ahora",
    allowOutsideClick: false,
    allowEscapeKey: false,
    showCancelButton: false,
    customClass: {
      ...theme,
      confirmButton:
        "!bg-blue-600 hover:!bg-blue-500 !text-white !font-semibold !px-5 !py-2 !rounded-xl",
    },
    buttonsStyling: false,
  });
};
