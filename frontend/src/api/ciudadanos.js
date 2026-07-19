

import API from './axios';

// ── CRUD Admin ──────────────────────────────────────────────────────────

export const getCiudadanos = async () => {
  const response = await API.get('/ciudadanos');
  return response;
};

export const getCiudadanoById = async (id) => {
  const response = await API.get(`/ciudadanos/${id}`);
  return response;
};

export const updateCiudadano = async (id, data) => {
  const response = await API.put(`/ciudadanos/${id}`, data);
  return response;
};

export const deleteCiudadano = async (id) => {
  const response = await API.delete(`/ciudadanos/${id}`);
  return response;
};