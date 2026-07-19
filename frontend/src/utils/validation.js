/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: validation.js
 * UBICACIÓN: /frontend/src/utils/validation.js
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CORRECCIONES:
 * validateCedula: antes aceptaba 6-15 dígitos, ahora exactamente 11
 *    (igual que el modelo Usuario.js del backend)
 * Agregado validateNombre, validateTelefono
 */

export const validateEmail = (email) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

/**
 * Cédula dominicana: exactamente 11 dígitos numéricos
 */
export const validateCedula = (cedula) => {
  if (!cedula) return false;
  return /^\d{11}$/.test(String(cedula).trim());
};

export const validatePassword = (password) => {
  return !!password && password.length >= 6 && password.length <= 128;
};

export const validatePasswordConfirm = (password, confirm) => {
  return password === confirm;
};

export const validateAge = (fechaNacimiento) => {
  if (!fechaNacimiento) return false;
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  if (isNaN(nacimiento.getTime())) return false;
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad >= 18;
};

export const validateFechaEleccion = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return false;
  return new Date(fechaInicio) < new Date(fechaFin);
};

export const validateNombre = (nombre) => {
  if (!nombre) return false;
  return nombre.trim().length >= 3 && nombre.trim().length <= 100;
};

/**
 * Teléfono dominicano: exactamente 10 dígitos (sin guiones ni espacios)
 */
export const validateTelefono = (telefono) => {
  if (!telefono) return true; // Opcional
  return /^\d{10}$/.test(String(telefono).trim());
};

/**
 * Valida una imagen: Base64 o URL HTTPS
 */
export const validateImagen = (valor) => {
  if (!valor) return false;
  const esBase64 = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(valor);
  const esURL = /^https?:\/\/.+/.test(valor);
  return esBase64 || esURL;
};
