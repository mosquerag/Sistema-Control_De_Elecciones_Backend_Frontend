import API from './axios';

// Admin
export const registerAdmin = async (data) => {
  const response = await API.post('/auth/register/admin', data);
  return response.data; // ← IMPORTANTE: retornar response.data
};

export const loginAdmin = async (email, password) => {
  const response = await API.post('/auth/login/admin', { email, password });
  return response.data; // ← IMPORTANTE: retornar response.data
};

// Ciudadano
export const registerCiudadano = async (data) => {
  const response = await API.post('/auth/register/ciudadano', data);
  return response.data; // ← IMPORTANTE: retornar response.data
};

export const loginCiudadano = async (cedula, fechaNacimiento) => {
  const response = await API.post('/auth/login/ciudadano', { cedula, fechaNacimiento });
  return response.data; // ← IMPORTANTE: retornar response.data
};

// Candidato
export const registerCandidato = async (data) => {
  const response = await API.post('/auth/register/candidato', data);
  return response.data; // ← IMPORTANTE: retornar response.data
};

export const loginCandidato = async (cedula, nombre) => {
  const response = await API.post('/auth/login/candidato', { cedula, nombre });
  return response.data; // ← IMPORTANTE: retornar response.data
};

// Verificar token
export const verifyToken = async () => {
  const response = await API.get('/auth/verify-token');
  return response.data; // ← IMPORTANTE: retornar response.data
};

// Logout
export const logout = () => {
  document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  localStorage.removeItem('user');
};