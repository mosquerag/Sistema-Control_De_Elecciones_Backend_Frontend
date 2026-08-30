import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.error("❌ VITE_API_URL no está definida en .env");
}

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Ya no hace falta interceptor de REQUEST: el navegador adjunta
// automáticamente la cookie httpOnly "access_token" en cada petición.

// ── Interceptor de RESPONSE — refresh automático en 401 ─────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthRoute = originalRequest.url?.includes("/auth/");
      if (isAuthRoute) return Promise.reject(error);

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => API(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // El refresh_token viaja solo, como cookie httpOnly
        await API.post("/auth/refresh-token");
        processQueue(null);
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        localStorage.removeItem("user");
        document.cookie =
          "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        const currentPath = window.location.pathname;
        const publicPaths = [
          "/iniciosesion",
          "/registrarse",
          "/loginadmin",
          "/loginciudadano",
          "/logincandidato",
          "/",
        ];
        if (!publicPaths.some((p) => currentPath.startsWith(p))) {
          window.location.href = "/iniciosesion";
        }

        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default API;
