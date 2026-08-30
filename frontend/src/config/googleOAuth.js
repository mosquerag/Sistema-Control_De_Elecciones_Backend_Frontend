import API from "@/api/axios";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const isGoogleOAuthConfigured = () => {
  return !!GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== "undefined";
};

export const getGoogleAuthUrl = () => {
  return `${API_URL}/api/auth/google`;
};

export const extraerErrorDeURL = () => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("error")) {
    return {
      error: params.get("error"),
      message: params.get("message") || "Error de autenticación con Google",
    };
  }
  return null;
};

export const procesarCallbackGoogle = async () => {
  const response = await API.get("/auth/verify-token");
  if (!response.data?.success) {
    throw new Error("No se pudo verificar la sesión");
  }
  const usuario = response.data.data?.usuario;
  if (!usuario) throw new Error("No se pudo obtener información del usuario");
  return { usuario };
};

export const limpiarURLParametros = () => {
  const url = new URL(window.location.href);
  url.search = "";
  window.history.replaceState({}, document.title, url.toString());
};