import { createContext, useState, useEffect, useCallback } from "react";
import { verifyToken } from "@/api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Limpiar sesión ──────────────────────────────────────────────────
  // const clearSession = useCallback(() => {
  //   localStorage.removeItem("user");
  //   localStorage.removeItem("token");
  //   document.cookie =
  //     "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  //   setUser(null);
  //   setIsAuthenticated(false);
  // }, []);

  // // ── Verificar autenticación al cargar ───────────────────────────────
  // const checkAuth = useCallback(async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       setLoading(false);
  //       return;
  //     }

  //     // Siempre verificar con el backend para garantizar token válido
  //     const response = await verifyToken();
  const clearSession = useCallback(() => {
    localStorage.removeItem("user");
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // ── Verificar autenticación al cargar ───────────────────────────────
  const checkAuth = useCallback(async () => {
    try {
      // La cookie httpOnly no es legible desde JS — siempre se pregunta
      // al backend, que la valida automáticamente si existe.
      const response = await verifyToken();

      const userData = response?.data?.usuario || response?.usuario;

      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        clearSession();
      }
    } catch {
      // Token inválido o expirado — limpiar sesión
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ── Login ───────────────────────────────────────────────────────────
  // const login = useCallback((userData, token) => {
  //   if (!userData) return;

  //   localStorage.setItem("user", JSON.stringify(userData));
  //   if (token) localStorage.setItem("token", token);

  //   setUser(userData);
  //   setIsAuthenticated(true);
  // }, []);

  const login = useCallback((userData) => {
    if (!userData) return;

    localStorage.setItem("user", JSON.stringify(userData));
    // El token vive solo en la cookie httpOnly, nunca en JS.

    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  // ── Actualizar datos del usuario ────────────────────────────────────
  const updateUser = useCallback((updatedData) => {
    if (!updatedData) return;
    setUser((prev) => {
      const newData = { ...prev, ...updatedData };
      localStorage.setItem("user", JSON.stringify(newData));
      return newData;
    });
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
