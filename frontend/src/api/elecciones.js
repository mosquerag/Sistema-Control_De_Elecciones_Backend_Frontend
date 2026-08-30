import API from './axios';

export const getElecciones = () => API.get('/elecciones');
export const getEleccionesActivas = () => API.get('/elecciones/activas');
export const getEleccionById = (id) => API.get(`/elecciones/${id}`);
export const createEleccion = (data) => API.post('/elecciones', data);
export const updateEleccion = (id, data) => API.put(`/elecciones/${id}`, data);
export const deleteEleccion = (id) => API.delete(`/elecciones/${id}`);
export const desactivarEleccion = (id) => API.patch(`/elecciones/${id}/desactivar`);
export const getEleccionesCiudadano = () => API.get('/elecciones/ciudadano');