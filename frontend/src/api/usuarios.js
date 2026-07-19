


import API from './axios';

export const getUsuarios = () => API.get('/usuarios');
export const getUsuariosByRol = (rol) => API.get(`/usuarios/rol/${rol}`);
export const getUsuarioById = (id) => API.get(`/usuarios/${id}`);
export const updateUsuario = (id, data) => API.put(`/usuarios/${id}`, data);
export const desactivarUsuario = (id) => API.patch(`/usuarios/${id}/desactivar`);
export const deleteUsuario = (id) => API.delete(`/usuarios/${id}`);

