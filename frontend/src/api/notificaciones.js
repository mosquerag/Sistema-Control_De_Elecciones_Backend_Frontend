/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: notificaciones.js
 * UBICACIÓN: /frontend/src/api/notificaciones.js
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CAMBIOS:
 * ✅ Eliminado console.log de rechazarUsuarioDesdeNotificacion
 * ✅ Eliminada versión comentada de rechazarUsuarioDesdeNotificacion
 */

import API from './axios';

export const getNotificaciones = async () => {
  const response = await API.get('/notificaciones');
  return response.data;
};

export const getNotificacionesNoLeidas = async () => {
  const response = await API.get('/notificaciones/no-leidas');
  return response.data;
};

export const marcarComoLeida = async (id) => {
  const response = await API.patch(`/notificaciones/${id}/leer`);
  return response.data;
};

export const aprobarUsuarioDesdeNotificacion = async (idNotificacion, idUsuario) => {
  const response = await API.post(`/notificaciones/${idNotificacion}/aprobar`, { idUsuario });
  return response.data;
};

export const rechazarUsuarioDesdeNotificacion = async (idNotificacion, idUsuario) => {
  const response = await API.put(`/notificaciones/${idNotificacion}/rechazar`, { idUsuario });
  return response.data;
};