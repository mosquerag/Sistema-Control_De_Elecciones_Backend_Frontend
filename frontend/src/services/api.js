/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: api.js
 * UBICACIÓN: /frontend/src/services/api.js
 * DESCRIPCIÓN: Servicio centralizado para todas las llamadas a la API
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * FUNCIÓN:
 * - Configuración base de axios
 * - Interceptores de request/response
 * - Manejo automático de tokens
 * - Manejo de errores centralizado
 * - Refresh token automático
 * 
 * DEPENDE DE:
 * - axios (cliente HTTP)
 * - Variables de entorno (VITE_API_URL)
 * 
 * ES USADO POR:
 * - Todos los servicios específicos (authService, approvalService, etc.)
 * - Componentes que necesiten hacer peticiones HTTP
 * 
 * HIJOS:
 * - authService.js
 * - approvalService.js
 * - profileService.js
 * - notificacionesService.js
 * - eleccionesService.js
 * - candidatosService.js
 * - votosService.js
 */

import axios from 'axios';
import { mostrarAlerta } from '../utils/alertas';

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN BASE
// ═══════════════════════════════════════════════════════════════════════

/**
 * URL base de la API desde variables de entorno
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Instancia de axios con configuración base
 */
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Importante para cookies
});

// ═══════════════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════

/**
 * @function obtenerToken
 * @description Obtiene el token del localStorage
 * @returns {String|null} Token o null
 */
const obtenerToken = () => {
  return localStorage.getItem('token');
};

/**
 * @function obtenerRefreshToken
 * @description Obtiene el refresh token del localStorage
 * @returns {String|null} Refresh token o null
 */
const obtenerRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

/**
 * @function guardarToken
 * @description Guarda el token en localStorage
 * @param {String} token - Token a guardar
 */
const guardarToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  }
};

/**
 * @function limpiarTokens
 * @description Limpia todos los tokens del localStorage
 */
const limpiarTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('usuario');
};

/**
 * @function redirigirALogin
 * @description Redirige al usuario a la página de login
 */
const redirigirALogin = () => {
  limpiarTokens();
  window.location.href = '/iniciosesion';
};

// ═══════════════════════════════════════════════════════════════════════
// INTERCEPTOR DE REQUEST
// ═══════════════════════════════════════════════════════════════════════

/**
 * Interceptor que se ejecuta ANTES de cada petición
 * Agrega el token de autenticación automáticamente
 */
api.interceptors.request.use(
  (config) => {
    // Obtener token
    const token = obtenerToken();

    // Si existe token, agregarlo al header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log en desarrollo
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════════════════
// INTERCEPTOR DE RESPONSE
// ═══════════════════════════════════════════════════════════════════════

/**
 * Variable para rastrear si ya estamos renovando el token
 * Evita múltiples llamadas simultáneas al endpoint de refresh
 */
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * @function subscribeTokenRefresh
 * @description Agrega una función a la cola de espera del refresh
 * @param {Function} callback - Función a ejecutar después del refresh
 */
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * @function onTokenRefreshed
 * @description Ejecuta todas las funciones en cola después del refresh
 * @param {String} token - Nuevo token
 */
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * Interceptor que se ejecuta DESPUÉS de cada respuesta
 * Maneja errores y renueva tokens automáticamente
 */
api.interceptors.response.use(
  (response) => {
    // Log en desarrollo
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.log(`📥 ${response.config.method.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log de error
    console.error('❌ Error en response:', {
      url: originalRequest?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    // ─────────────────────────────────────────────────────────────────
    // CASO 1: TOKEN EXPIRADO (401)
    // ─────────────────────────────────────────────────────────────────
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Si la petición es al endpoint de refresh, no intentar renovar
      if (originalRequest.url.includes('/auth/refresh-token')) {
        console.error('❌ Refresh token inválido o expirado');
        mostrarAlerta('error', 'Sesión expirada', 'Por favor, inicia sesión nuevamente');
        redirigirALogin();
        return Promise.reject(error);
      }

      // Marcar que ya intentamos renovar este request
      originalRequest._retry = true;

      // Si ya estamos renovando, agregar a la cola
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // Intentar renovar el token
        const refreshToken = obtenerRefreshToken();

        if (!refreshToken) {
          throw new Error('No hay refresh token');
        }

        console.log('🔄 Renovando token...');

        const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
          refreshToken
        });

        const { token: nuevoToken } = response.data.data;

        // Guardar nuevo token
        guardarToken(nuevoToken);

        // Notificar a todos los requests en espera
        onTokenRefreshed(nuevoToken);

        // Actualizar el request original
        originalRequest.headers.Authorization = `Bearer ${nuevoToken}`;

        console.log('✅ Token renovado exitosamente');

        isRefreshing = false;

        // Reintentar el request original
        return api(originalRequest);

      } catch (refreshError) {
        console.error('❌ Error al renovar token:', refreshError);
        
        isRefreshing = false;
        refreshSubscribers = [];

        mostrarAlerta('error', 'Sesión expirada', 'Por favor, inicia sesión nuevamente');
        redirigirALogin();

        return Promise.reject(refreshError);
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // CASO 2: FORBIDDEN (403)
    // ─────────────────────────────────────────────────────────────────
    
    if (error.response?.status === 403) {
      const mensaje = error.response.data?.message || 'No tienes permisos para realizar esta acción';
      mostrarAlerta('error', 'Acceso denegado', mensaje);
    }

    // ─────────────────────────────────────────────────────────────────
    // CASO 3: NOT FOUND (404)
    // ─────────────────────────────────────────────────────────────────
    
    if (error.response?.status === 404) {
      const mensaje = error.response.data?.message || 'Recurso no encontrado';
      mostrarAlerta('error', 'No encontrado', mensaje);
    }

    // ─────────────────────────────────────────────────────────────────
    // CASO 4: SERVER ERROR (500)
    // ─────────────────────────────────────────────────────────────────
    
    if (error.response?.status === 500) {
      mostrarAlerta('error', 'Error del servidor', 'Ocurrió un error en el servidor. Por favor, intenta nuevamente.');
    }

    // ─────────────────────────────────────────────────────────────────
    // CASO 5: NETWORK ERROR (sin respuesta)
    // ─────────────────────────────────────────────────────────────────
    
    if (!error.response) {
      mostrarAlerta('error', 'Error de conexión', 'No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    }

    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════════════════
// FUNCIONES HELPER PARA REQUESTS
// ═══════════════════════════════════════════════════════════════════════

/**
 * @function manejarError
 * @description Extrae el mensaje de error de la respuesta
 * @param {Error} error - Error de axios
 * @returns {String} Mensaje de error
 */
export const manejarError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.message) {
    return error.message;
  }

  return 'Ocurrió un error desconocido';
};

/**
 * @function manejarExito
 * @description Extrae los datos de una respuesta exitosa
 * @param {Object} response - Respuesta de axios
 * @returns {Object} Datos de la respuesta
 */
export const manejarExito = (response) => {
  return response.data;
};

// ═══════════════════════════════════════════════════════════════════════
// MÉTODOS HTTP WRAPPER
// ═══════════════════════════════════════════════════════════════════════

/**
 * @function GET
 * @description Realiza una petición GET
 * @param {String} endpoint - Endpoint a consultar
 * @param {Object} config - Configuración adicional de axios
 * @returns {Promise} Promesa con la respuesta
 */
export const GET = async (endpoint, config = {}) => {
  try {
    const response = await api.get(endpoint, config);
    return manejarExito(response);
  } catch (error) {
    throw new Error(manejarError(error));
  }
};

/**
 * @function POST
 * @description Realiza una petición POST
 * @param {String} endpoint - Endpoint a consultar
 * @param {Object} data - Datos a enviar
 * @param {Object} config - Configuración adicional de axios
 * @returns {Promise} Promesa con la respuesta
 */
export const POST = async (endpoint, data = {}, config = {}) => {
  try {
    const response = await api.post(endpoint, data, config);
    return manejarExito(response);
  } catch (error) {
    throw new Error(manejarError(error));
  }
};

/**
 * @function PUT
 * @description Realiza una petición PUT
 * @param {String} endpoint - Endpoint a consultar
 * @param {Object} data - Datos a actualizar
 * @param {Object} config - Configuración adicional de axios
 * @returns {Promise} Promesa con la respuesta
 */
export const PUT = async (endpoint, data = {}, config = {}) => {
  try {
    const response = await api.put(endpoint, data, config);
    return manejarExito(response);
  } catch (error) {
    throw new Error(manejarError(error));
  }
};

/**
 * @function DELETE
 * @description Realiza una petición DELETE
 * @param {String} endpoint - Endpoint a consultar
 * @param {Object} config - Configuración adicional de axios
 * @returns {Promise} Promesa con la respuesta
 */
export const DELETE = async (endpoint, config = {}) => {
  try {
    const response = await api.delete(endpoint, config);
    return manejarExito(response);
  } catch (error) {
    throw new Error(manejarError(error));
  }
};

/**
 * @function PATCH
 * @description Realiza una petición PATCH
 * @param {String} endpoint - Endpoint a consultar
 * @param {Object} data - Datos a actualizar parcialmente
 * @param {Object} config - Configuración adicional de axios
 * @returns {Promise} Promesa con la respuesta
 */
export const PATCH = async (endpoint, data = {}, config = {}) => {
  try {
    const response = await api.patch(endpoint, data, config);
    return manejarExito(response);
  } catch (error) {
    throw new Error(manejarError(error));
  }
};

// ═══════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════

/**
 * @function setToken
 * @description Establece el token manualmente
 * @param {String} token - Token a establecer
 */
export const setToken = (token) => {
  guardarToken(token);
};

/**
 * @function clearTokens
 * @description Limpia todos los tokens
 */
export const clearTokens = () => {
  limpiarTokens();
};

/**
 * @function isAuthenticated
 * @description Verifica si el usuario está autenticado
 * @returns {Boolean} true si hay token, false si no
 */
export const isAuthenticated = () => {
  return !!obtenerToken();
};

/**
 * @function getApiUrl
 * @description Obtiene la URL base de la API
 * @returns {String} URL base
 */
export const getApiUrl = () => {
  return API_URL;
};


export default api;

