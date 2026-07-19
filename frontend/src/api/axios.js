// /**
//  * ═══════════════════════════════════════════════════════════════════════
//  * ARCHIVO: axios.js
//  * UBICACIÓN: /frontend/src/api/axios.js
//  * DESCRIPCIÓN: Instancia de Axios configurada para el backend
//  * ═══════════════════════════════════════════════════════════════════════
//  *
//  * MEJORAS APLICADAS:
//  * ✅ URL del backend desde variable de entorno (nunca hardcodeada)
//  * ✅ Eliminados todos los console.log
//  * ✅ Interceptor de refresh token automático
//  * ✅ Manejo de errores 401 con redirección limpia
//  * ✅ Token siempre desde localStorage (no expuesto en código)
//  */

// import axios from "axios";

// // La URL del backend viene SIEMPRE de variable de entorno
// // En producción: VITE_API_URL=https://tu-backend.com
// // En desarrollo: VITE_API_URL=http://localhost:4000
// const BASE_URL = import.meta.env.VITE_API_URL;

// if (!BASE_URL) {
//   console.error("❌ VITE_API_URL no está definida en .env");
// }

// const API = axios.create({
//   baseURL: `${BASE_URL}/api`,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 30000, // 30 segundos máximo por petición
// });

// // ── Interceptor de REQUEST — adjuntar token ──────────────────────────
// API.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// // ── Interceptor de RESPONSE — manejar errores globalmente ───────────
// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) prom.reject(error);
//     else prom.resolve(token);
//   });
//   failedQueue = [];
// };

// API.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Manejar 401 — token expirado o inválido
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       // No intentar refresh en rutas de auth
//       const isAuthRoute = originalRequest.url?.includes("/auth/");
//       if (isAuthRoute) return Promise.reject(error);

//       if (isRefreshing) {
//         // Si ya se está haciendo refresh, encolar la petición
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             return API(originalRequest);
//           })
//           .catch((err) => Promise.reject(err));
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         const refreshToken = localStorage.getItem("refreshToken");
//         if (!refreshToken) throw new Error("No refresh token");

//         const response = await API.post("/auth/refresh-token", {
//           refreshToken,
//         });
//         const newToken = response.data?.data?.accessToken;

//         if (newToken) {
//           localStorage.setItem("token", newToken);
//           originalRequest.headers.Authorization = `Bearer ${newToken}`;
//           processQueue(null, newToken);
//           return API(originalRequest);
//         }

//         throw new Error("No new token received");
//       } catch {
//         processQueue(new Error("Session expired"), null);

//         // Limpiar sesión y redirigir a login
//         localStorage.removeItem("user");
//         localStorage.removeItem("token");
//         localStorage.removeItem("refreshToken");
//         document.cookie =
//           "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

//         const currentPath = window.location.pathname;
//         const publicPaths = [
//           "/iniciosesion",
//           "/registrarse",
//           "/loginadmin",
//           "/loginciudadano",
//           "/logincandidato",
//           "/",
//         ];
//         if (!publicPaths.some((p) => currentPath.startsWith(p))) {
//           window.location.href = "/iniciosesion";
//         }

//         return Promise.reject(error);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   },
// );

// export default API;

/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: axios.js
 * UBICACIÓN: /frontend/src/api/axios.js
 * DESCRIPCIÓN: Instancia de Axios — auth 100% vía cookies httpOnly
 * ═══════════════════════════════════════════════════════════════════════
 */

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
