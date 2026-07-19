/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: approvalService.js
 * UBICACIÓN: /frontend/src/services/approvalService.js
 * DESCRIPCIÓN: Servicio para gestión de aprobación de usuarios
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * FUNCIÓN:
 * - Obtener usuarios pendientes de aprobación
 * - Aprobar/rechazar usuarios
 * - Bloquear/desbloquear usuarios
 * - Gestionar notificaciones de aprobación
 * - Obtener estadísticas
 * 
 * DEPENDE DE:
 * - api.js (servicio base)
 * 
 * ES USADO POR:
 * - Componentes del panel de administración
 * - GestionUsuarios.jsx
 * - NotificacionesPanel.jsx
 * - DashboardAdmin.jsx
 * 
 * PADRE: api.js
 */

import { GET, POST, PUT, DELETE } from './api';

// ═══════════════════════════════════════════════════════════════════════
// LISTADO
// ═══════════════════════════════════════════════════════════════════════

/**
 * @function obtenerPendientes
 * @description Obtiene lista de usuarios pendientes de aprobación
 * @param {Object} params - Parámetros de búsqueda
 * @param {String} params.tipo - Filtro por tipo (ciudadano, candidato, todos)
 * @param {Number} params.page - Página actual
 * @param {Number} params.limit - Elementos por página
 * @returns {Promise<Object>} Lista paginada de usuarios
 * 
 * @ejemplo
 * const pendientes = await obtenerPendientes({ tipo: 'candidato', page: 1, limit: 10 });
 */
export const obtenerPendientes = async (params = {}) => {
  const queryParams = new URLSearchParams({
    tipo: params.tipo || 'todos',
    page: params.page || 1,
    limit: params.limit || 20
  }).toString();

  return await GET(`/approval/pendientes?${queryParams}`);
};

/**
 * @function obtenerNotificaciones
 * @description Obtiene notificaciones pendientes para administradores
 * @param {Object} params - Parámetros de búsqueda
 * @param {String} params.tipo - Filtro por tipo de acción
 * @param {Boolean} params.soloNoLeidas - Solo notificaciones no leídas
 * @returns {Promise<Object>} Lista de notificaciones
 * 
 * @ejemplo
 * const notificaciones = await obtenerNotificaciones({ soloNoLeidas: true });
 */
export const obtenerNotificaciones = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.tipo) {
    queryParams.append('tipo', params.tipo);
  }
  
  if (params.soloNoLeidas !== undefined) {
    queryParams.append('soloNoLeidas', params.soloNoLeidas);
  }

  const query = queryParams.toString();
  const endpoint = query ? `/approval/notificaciones?${query}` : '/approval/notificaciones';

  return await GET(endpoint);
};

/**
 * @function obtenerEstadisticas
 * @description Obtiene estadísticas de aprobaciones/rechazos
 * @returns {Promise<Object>} Estadísticas del sistema
 * 
 * @ejemplo
 * const stats = await obtenerEstadisticas();
 * console.log(stats.data.usuarios.pendientes); // 5
 */
export const obtenerEstadisticas = async () => {
  return await GET('/approval/estadisticas');
};

// ═══════════════════════════════════════════════════════════════════════
// APROBACIÓN
// ═══════════════════════════════════════════════════════════════════════

/**
 * @function aprobarUsuario
 * @description Aprueba un usuario pendiente
 * @param {String} id - ID del usuario a aprobar
 * @param {String} comentario - Comentario opcional del admin
 * @returns {Promise<Object>} Usuario aprobado
 * 
 * @ejemplo
 * await aprobarUsuario('507f1f77bcf86cd799439011', 'Documentación correcta');
 */
export const aprobarUsuario = async (id, comentario = '') => {
  return await PUT(`/approval/aprobar/${id}`, { comentario });
};

/**
 * @function rechazarUsuario
 * @description Rechaza un usuario pendiente
 * @param {String} id - ID del usuario a rechazar
 * @param {String} motivo - Motivo del rechazo (obligatorio)
 * @param {String} comentario - Comentario adicional
 * @returns {Promise<Object>} Confirmación de rechazo
 * 
 * @ejemplo
 * await rechazarUsuario('507f1f77bcf86cd799439011', 'Documentación incompleta', 'Falta cédula');
 */
export const rechazarUsuario = async (id, motivo, comentario = '') => {
  return await PUT(`/approval/rechazar/${id}`, { motivo, comentario });
};

// ═══════════════════════════════════════════════════════════════════════
// BLOQUEO
// ═══════════════════════════════════════════════════════════════════════

/**
 * @function bloquearUsuario
 * @description Bloquea un usuario
 * @param {String} id - ID del usuario a bloquear
 * @param {String} motivo - Motivo del bloqueo (obligatorio)
 * @returns {Promise<Object>} Usuario bloqueado
 * 
 * @ejemplo
 * await bloquearUsuario('507f1f77bcf86cd799439011', 'Actividad sospechosa');
 */
export const bloquearUsuario = async (id, motivo) => {
  return await PUT(`/approval/bloquear/${id}`, { motivo });
};

/**
 * @function desbloquearUsuario
 * @description Desbloquea un usuario previamente bloqueado
 * @param {String} id - ID del usuario a desbloquear
 * @param {String} comentario - Comentario opcional
 * @returns {Promise<Object>} Usuario desbloqueado
 * 
 * @ejemplo
 * await desbloquearUsuario('507f1f77bcf86cd799439011', 'Situación resuelta');
 */
export const desbloquearUsuario = async (id, comentario = '') => {
  return await PUT(`/approval/desbloquear/${id}`, { comentario });
};

// ═══════════════════════════════════════════════════════════════════════
// GESTIÓN DE NOTIFICACIONES
// ═══════════════════════════════════════════════════════════════════════

/**
 * @function marcarNotificacionLeida
 * @description Marca una notificación como leída
 * @param {String} id - ID de la notificación
 * @returns {Promise<Object>} Notificación actualizada
 * 
 * @ejemplo
 * await marcarNotificacionLeida('507f1f77bcf86cd799439011');
 */
export const marcarNotificacionLeida = async (id) => {
  return await PUT(`/approval/notificaciones/${id}/leer`);
};

/**
 * @function procesarNotificacion
 * @description Procesa una notificación (aprobar, rechazar o bloquear)
 * @param {String} id - ID de la notificación
 * @param {String} accion - Acción a realizar (aprobar, rechazar, bloquear)
 * @param {String} motivo - Motivo (obligatorio para rechazar y bloquear)
 * @param {String} comentario - Comentario adicional
 * @returns {Promise<Object>} Resultado del procesamiento
 * 
 * @ejemplo
 * // Aprobar
 * await procesarNotificacion('507f1f77bcf86cd799439011', 'aprobar', '', 'Todo correcto');
 * 
 * // Rechazar
 * await procesarNotificacion('507f1f77bcf86cd799439011', 'rechazar', 'Datos incompletos');
 * 
 * // Bloquear
 * await procesarNotificacion('507f1f77bcf86cd799439011', 'bloquear', 'Actividad sospechosa');
 */
export const procesarNotificacion = async (id, accion, motivo = '', comentario = '') => {
  return await POST(`/approval/notificaciones/${id}/procesar`, {
    accion,
    motivo,
    comentario
  });
};

// ═══════════════════════════════════════════════════════════════════════
// EXPORTACIÓN POR DEFECTO
// ═══════════════════════════════════════════════════════════════════════

export default {
  // Listado
  obtenerPendientes,
  obtenerNotificaciones,
  obtenerEstadisticas,
  
  // Aprobación
  aprobarUsuario,
  rechazarUsuario,
  
  // Bloqueo
  bloquearUsuario,
  desbloquearUsuario,
  
  // Notificaciones
  marcarNotificacionLeida,
  procesarNotificacion
};