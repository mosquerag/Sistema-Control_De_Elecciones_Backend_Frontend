/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: main.jsx
 * UBICACIÓN: /frontend/src/main.jsx
 * DESCRIPCIÓN: Punto de entrada de la aplicación React
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CORRECCIONES APLICADAS:
 * ToastContainer movido DENTRO del BrowserRouter y providers
 * ThemeProvider importado desde context/ (ubicación unificada)
 *  Orden correcto de providers
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <App />
          {/* ToastContainer DENTRO del árbol para acceder al tema */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
