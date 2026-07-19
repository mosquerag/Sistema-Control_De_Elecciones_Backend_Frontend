/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: authService.js
 * UBICACIÓN: /frontend/src/services/authService.js
 * DESCRIPCIÓN: Servicio para todas las operaciones de autenticación
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * FUNCIÓN:
 * - Registro de usuarios (admin, ciudadano, candidato)
 * - Login de usuarios (admin, ciudadano, candidato)
 * - Login con Google OAuth
 * - Logout
 * - Verificación de token
 * - Refresh token
 * - Cambio de contraseña
 * 
 * DEPENDE DE:
 * - api.js (servicio base)
 * 
 * ES USADO POR:
 * - AuthContext.jsx
 * - LoginForm.jsx
 * - RegisterForm.jsx
 * - Componentes de autenticación
 * 
 * PADRE: api.js
 */

import { GET, POST, PUT } from './api';

// ═══════════════════════════════════════════════════════════════════════
// REGISTRO
// ═══════════════════════════════════════════════════════════════════════

/**
 * @function registerAdmin
 * @description Registra un nuevo administrador
 * @param {Object} datos - Datos del administrador
 * @returns {Promise<Object>} Usuario registrado y token
 */
export const registerAdmin = async (datos) => {
  return await POST('/auth/register/admin', datos);
};

/**
 * @function registerCiudadano
 * @description Registra un nuevo ciudadano
 * @param {Object} datos - Datos del ciudadano
 * @returns {Promise<Object>} Mensaje de registro exitoso
 */
export const registerCiudadano = async (datos) => {
  return await POST('/auth/register/ciudadano', datos);
};

/**
 * @function registerCandidato
 * @description Registra un nuevo candidato
 * @param {Object} datos - Datos del candidato
 * @returns {Promise<Object>} Mensaje de postulación exitosa
 */
export const registerCandidato = async (datos) => {
  return await POST('/auth/register/candidato', datos);
};

// ═══════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════

/**
 * @function loginAdmin
 * @description Login de administrador
 * @param {String} email - Email del admin
 * @param {String} password - Contraseña
 * @returns {Promise<Object>} Usuario y token
 */
export const loginAdmin = async (email, password) => {
  return await POST('/auth/login/admin', { email, password });
};

/**
 * @function loginCiudadano
 * @description Login de ciudadano
 * @param {String} cedula - Cédula (11 dígitos)
 * @param {Date} fechaNacimiento - Fecha de nacimiento
 * @returns {Promise<Object>} Usuario y token
 */
export const loginCiudadano = async (cedula, fechaNacimiento) => {
  return await POST('/auth/login/ciudadano', { cedula, fechaNacimiento });
};

/**
 * @function loginCandidato
 * @description Login de candidato
 * @param {String} cedula - Cédula (11 dígitos)
 * @param {String} nombre - Nombre del candidato
 * @returns {Promise<Object>} Usuario y token
 */
export const loginCandidato = async (cedula, nombre) => {
  return await POST('/auth/login/candidato', { cedula, nombre });
};

// ═══════════════════════════════════════════════════════════════════════
// GOOGLE OAUTH
// ═══════════════════════════════════════════════════════════════════════

/**
 * @function verificarGoogleCallback
 * @description Verifica el callback de Google después del login
 * @returns {Promise<Object>} Datos del usuario autenticado
 * 
 * @nota Esta función se usa después de que Google redirige de vuelta
 */
export const verificarGoogleCallback = async () => {
  return await POST('/auth/google/success');
};

// ═══════════════════════════════════════════════════════════════════════
// GESTIÓN DE SESIÓN
// ═══════════════════════════════════════════════════════════════════════

/**
 * @function logout
 * @description Cierra la sesión del usuario
 * @returns {Promise<Object>} Mensaje de confirmación
 */
export const logout = async () => {
  return await POST('/auth/logout');
};

/**
 * @function verifyToken
 * @description Verifica si el token actual es válido
 * @returns {Promise<Object>} Datos del usuario
 */
export const verifyToken = async () => {
  return await GET('/auth/verify-token');
};

/**
 * @function refreshToken
 * @description Renueva el access token usando el refresh token
 * @param {String} refreshToken - Refresh token
 * @returns {Promise<Object>} Nuevo token
 */
export const refreshToken = async (refreshToken) => {
  return await POST('/auth/refresh-token', { refreshToken });
};

/**
 * @function changePassword
 * @description Cambia la contraseña del usuario
 * @param {String} passwordActual - Contraseña actual
 * @param {String} passwordNuevo - Nueva contraseña
 * @returns {Promise<Object>} Mensaje de confirmación
 */
export const changePassword = async (passwordActual, passwordNuevo) => {
  return await PUT('/auth/change-password', { passwordActual, passwordNuevo });
};

// ═══════════════════════════════════════════════════════════════════════
// EXPORTACIÓN POR DEFECTO
// ═══════════════════════════════════════════════════════════════════════

export default {
  // Registro
  registerAdmin,
  registerCiudadano,
  registerCandidato,
  
  // Login
  loginAdmin,
  loginCiudadano,
  loginCandidato,
  
  // Google OAuth
  verificarGoogleCallback,
  
  // Gestión de sesión
  logout,
  verifyToken,
  refreshToken,
  changePassword
};