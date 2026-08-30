import API from './axios';

// ── Registro público ────────────────────────────────────────────────────

export const registerAdmin = async (data) => {
  const response = await API.post('/auth/register/admin', data);
  return response.data;
};

export const registerCiudadano = async (data) => {
  const response = await API.post('/auth/register/ciudadano', data);
  return response.data;
};

export const registerCandidato = async (data) => {
  const response = await API.post('/auth/register/candidato', data);
  return response.data;
};

// ── Registro por admin (rutas protegidas) ───────────────────────────────

export const registerAdminByAdmin = async (data) => {
  const response = await API.post('/auth/admin/register/admin', data);
  return response.data;
};

export const registerCiudadanoByAdmin = async (data) => {
  const response = await API.post('/auth/admin/register/ciudadano', data);
  return response.data;
};

export const registerCandidatoByAdmin = async (data) => {
  const response = await API.post('/auth/admin/register/candidato', data);
  return response.data;
};

// ── Login ───────────────────────────────────────────────────────────────

export const loginAdmin = async (email, password) => {
  const response = await API.post('/auth/login/admin', { email, password });
  return response.data;
};

// export const loginCiudadano = async (cedula, fechaNacimiento) => {
//   const response = await API.post('/auth/login/ciudadano', { cedula, fechaNacimiento });
//   return response.data;
// };

export const loginCiudadano = async (cedula, password) => {
  const response = await API.post('/auth/login/ciudadano', { cedula, password });
  return response.data;
};

// export const loginCandidato = async (cedula, nombre) => {
//   const response = await API.post('/auth/login/candidato', { cedula, nombre });
//   return response.data;
// };

export const loginCandidato = async (cedula, password) => {
  const response = await API.post('/auth/login/candidato', { cedula, password });
  return response.data;
};

// ── Sesión ──────────────────────────────────────────────────────────────

export const verifyToken = async () => {
  const response = await API.get('/auth/verify-token');
  return response.data;
};

// export const logout = () => {
//   document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
//   localStorage.removeItem('user');
//   localStorage.removeItem('token');
// };

export const logout = () => {
  document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  localStorage.removeItem('user');
};

export const verifyIdentity = async (cedula, email) => {
  const response = await API.post('/auth/verify-identity', { cedula, email });
  return response.data;
};
export const resetPassword = async (resetToken, passwordNueva, confirmPassword) => {
  const response = await API.post('/auth/reset-password', { resetToken, passwordNueva, confirmPassword });
  return response.data;
};