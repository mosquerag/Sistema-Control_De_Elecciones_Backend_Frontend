/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: candidatos.js
 * UBICACIÓN: /frontend/src/api/candidatos.js
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CORRECCIONES:
 * ✅ registerCandidato apuntaba a /auth/register-candidato (no existía)
 *    → corregido a /auth/register/candidato
 */

import API from './axios';

export const getCandidatos       = ()          => API.get('/candidatos');
export const getCandidatosByEleccion = (id)    => API.get(`/candidatos/eleccion/${id}`);
export const getCandidatoById    = (id)        => API.get(`/candidatos/${id}`);
export const registerCandidato   = (data)      => API.post('/auth/register/candidato', data);
export const updateCandidato     = (id, data)  => API.put(`/candidatos/${id}`, data);
export const deleteCandidato     = (id)        => API.delete(`/candidatos/${id}`);
export const desactivarCandidato = (id)        => API.patch(`/candidatos/${id}/desactivar`);