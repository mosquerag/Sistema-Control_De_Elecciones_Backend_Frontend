/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: tiposElecciones.js
 * UBICACIÓN: /frontend/src/api/tiposElecciones.js
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CORRECCIONES:
 * ✅ desactivarTipoEleccion usaba PUT → corregido a PATCH (backend usa PATCH)
 */

import API from './axios';

export const getTiposEleccion       = ()          => API.get('/tipos-elecciones');
export const getTipoEleccionById    = (id)        => API.get(`/tipos-elecciones/${id}`);
export const createTipoEleccion     = (data)      => API.post('/tipos-elecciones', data);
export const updateTipoEleccion     = (id, data)  => API.put(`/tipos-elecciones/${id}`, data);
export const deleteTipoEleccion     = (id)        => API.delete(`/tipos-elecciones/${id}`);
export const desactivarTipoEleccion = (id)        => API.patch(`/tipos-elecciones/${id}/desactivar`);