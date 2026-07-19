
import API from "@/api/axios";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Verifica si Google OAuth está configurado
 */
export const isGoogleOAuthConfigured = () => {
  return !!GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== "undefined";
};

/**
 * Construye la URL de inicio de OAuth con el rol codificado en el state
 */
export const getGoogleAuthUrl = (rol = "ciudadano") => {
  const rolesPermitidos = ["admin", "ciudadano", "candidato"];
  const rolFinal = rolesPermitidos.includes(rol) ? rol : "ciudadano";
  return `${API_URL}/api/auth/google?state=${rolFinal}`;
};

/**
 * Extrae tokens del URL tras el redirect de Google
 * Devuelve { token, refreshToken, error, message } o null si no hay nada
 */
export const extraerTokensDeURL = () => {
  const params = new URLSearchParams(window.location.search);

  if (params.has("error")) {
    return {
      error: params.get("error"),
      message: params.get("message") || "Error de autenticación con Google",
    };
  }

  const token = params.get("token");
  const refreshToken = params.get("refreshToken");

  if (!token) return null;
  return { token, refreshToken };
};

/**
 * Procesa el callback de Google: valida el token con el backend
 * y devuelve { usuario, token }
 */
export const procesarCallbackGoogle = async (token, refreshToken) => {
  if (!token) throw new Error("Token no válido");

  // Guardar tokens en localStorage
  localStorage.setItem("token", token);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

  // Verificar token con el backend y obtener datos del usuario
  const response = await API.get("/auth/verify-token", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.data?.success) {
    throw new Error("No se pudo verificar el token");
  }

  const usuario =
    response.data.data?.usuario || response.data.data || response.data.user;
  if (!usuario) throw new Error("No se pudo obtener información del usuario");

  localStorage.setItem("user", JSON.stringify(usuario));
  return { usuario, token };
};

/**
 * Limpia los parámetros de la URL tras el proceso OAuth
 */
export const limpiarURLParametros = () => {
  const url = new URL(window.location.href);
  url.search = "";
  window.history.replaceState({}, document.title, url.toString());
};
