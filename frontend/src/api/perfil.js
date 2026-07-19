import API from "./axios";

// Obtener perfil del usuario autenticado
export const getPerfil = async () => {
  const response = await API.get("/profile"); // ✅ Cambiado
  return response.data;
};

// Actualizar perfil
export const updatePerfil = async (data) => {
  const response = await API.put("/profile", data); // ✅ Cambiado
  return response.data;
};

// Cambiar contraseña
export const cambiarPassword = async (data) => {
  const response = await API.put("/profile/cambiar-password", data); // ✅ Cambiado
  return response.data;
};

// Actualizar foto de perfil
export const updateFotoPerfil = async (fotoBase64) => {
  const response = await API.put("/profile/foto", { fotoPerfil: fotoBase64 }); // ✅ Cambiado
  return response.data;
};
