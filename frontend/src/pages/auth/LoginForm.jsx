/**
 * ARCHIVO: LoginForm.jsx
 * UBICACIÓN: /frontend/src/pages/auth/LoginForm.jsx
 * DESCRIPCIÓN: Formulario de login reutilizable para todos los roles
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import Loader from "@/components/common/Loader";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Label from "@/components/common/Label";
import ThemeToggle from "@/components/ThemeToggle";
import { mostrarAlerta, alertaPerfilPendiente } from "@/utils/alertas";

const LOGIN_CONFIG = {
  admin: {
    title: "Iniciar Sesión Administrador",
    subtitle: "Acceso al panel administrativo",
    icon: "👨‍💼",
    fields: [
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "admin@ejemplo.com",
        required: true,
      },
      {
        name: "password",
        label: "Contraseña",
        type: "password",
        placeholder: "••••••••",
        required: true,
      },
    ],
  },
  // ciudadano: {
  //   title: "Iniciar Sesión Ciudadano",
  //   subtitle: "Acceso al sistema de votación",
  //   icon: "👤",
  //   fields: [
  //     {
  //       name: "cedula",
  //       label: "Cédula",
  //       type: "text",
  //       placeholder: "12345678901",
  //       required: true,
  //       maxLength: 11,
  //     },
  //     {
  //       name: "fechaNacimiento",
  //       label: "Fecha de Nacimiento",
  //       type: "date",
  //       required: true,
  //     },
  //   ],
  // },

  // candidato: {
  //   title: "Iniciar Sesión Candidato",
  //   subtitle: "Acceso al panel del candidato",
  //   icon: "🎖️",
  //   fields: [
  //     {
  //       name: "cedula",
  //       label: "Cédula",
  //       type: "text",
  //       placeholder: "12345678901",
  //       required: true,
  //       maxLength: 11,
  //     },
  //     {
  //       name: "nombre",
  //       label: "Nombre Completo",
  //       type: "text",
  //       placeholder: "Juan Pérez",
  //       required: true,
  //     },
  //   ],
  // },

  ciudadano: {
    title: "Iniciar Sesión Ciudadano",
    subtitle: "Acceso al sistema de votación",
    icon: "👤",
    fields: [
      {
        name: "cedula",
        label: "Cédula",
        type: "text",
        placeholder: "12345678901",
        required: true,
        maxLength: 11,
      },
      {
        name: "password",
        label: "Contraseña",
        type: "password",
        placeholder: "••••••••",
        required: true,
      },
    ],
  },
  candidato: {
    title: "Iniciar Sesión Candidato",
    subtitle: "Acceso al panel del candidato",
    icon: "🎖️",
    fields: [
      {
        name: "cedula",
        label: "Cédula",
        type: "text",
        placeholder: "12345678901",
        required: true,
        maxLength: 11,
      },
      {
        name: "password",
        label: "Contraseña",
        type: "password",
        placeholder: "••••••••",
        required: true,
      },
    ],
  },
};

const LoginForm = ({
  userType,
  loginFunction,
  successRoute,
  showBackButton = true,
  allowGoogleLogin = false,
}) => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const config = LOGIN_CONFIG[userType];
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Inicializar campos vacíos
  useEffect(() => {
    const initialData = {};
    config.fields.forEach((field) => {
      initialData[field.name] = "";
    });
    setFormData(initialData);
    setErrors({});
  }, [userType]);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      const routes = {
        admin: "/admin/dashboard",
        ciudadano: "/ciudadano/dashboard",
        candidato: "/candidato/dashboard",
      };
      navigate(routes[user.rol] || "/", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validarCampos = () => {
    const nuevosErrores = {};
    let valido = true;

    for (const field of config.fields) {
      const valor = formData[field.name];

      if (field.required && (!valor || valor.trim() === "")) {
        nuevosErrores[field.name] = `${field.label} es obligatorio`;
        valido = false;
        continue;
      }

      if (field.name === "cedula" && valor) {
        if (!/^\d{11}$/.test(valor)) {
          nuevosErrores.cedula =
            "La cédula debe tener exactamente 11 dígitos numéricos";
          valido = false;
        }
      }

      if (field.name === "email" && valor) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
          nuevosErrores.email = "Ingresa un email válido";
          valido = false;
        }
      }

      if (field.name === "password" && valor) {
        if (valor.length < 6) {
          nuevosErrores.password =
            "La contraseña debe tener al menos 6 caracteres";
          valido = false;
        }
      }
    }

    setErrors(nuevosErrores);

    if (!valido) {
      const primerError = Object.values(nuevosErrores)[0];
      mostrarAlerta("error", "Campo inválido", primerError);
    }

    return valido;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCampos()) return;

    setLoading(true);
    try {
      let params;
      // if (userType === "admin") {
      //   params = [formData.email, formData.password];
      // } else if (userType === "ciudadano") {
      //   params = [formData.cedula, formData.fechaNacimiento];
      // } else if (userType === "candidato") {
      //   params = [formData.cedula, formData.nombre];
      // }

      if (userType === "admin") {
        params = [formData.email, formData.password];
      } else if (userType === "ciudadano") {
        params = [formData.cedula, formData.password];
      } else if (userType === "candidato") {
        params = [formData.cedula, formData.password];
      }

      const response = await loginFunction(...params);

      // Extraer usuario y token de la respuesta (estructura: { data: { usuario, accessToken } })
      const data = response?.data || response;
      const usuario = data?.data?.usuario || data?.usuario || data;
      const token = data?.data?.accessToken || data?.accessToken || data?.token;

      if (!usuario) {
        throw new Error("No se recibieron datos del usuario");
      }

      login(usuario, token);

      // Si tiene perfil pendiente (creado por admin)
      if (usuario.perfilPendiente) {
        alertaPerfilPendiente(usuario.rol).then(() => {
          navigate(successRoute, {
            replace: true,
            state: { abrirConfiguracion: true },
          });
        });
        return;
      }

      mostrarAlerta(
        "success",
        `¡Bienvenido, ${usuario.nombre}!`,
        "Sesión iniciada correctamente",
      );
      setTimeout(() => navigate(successRoute, { replace: true }), 600);
    } catch (error) {
      const mensaje =
        error?.response?.data?.message ||
        error?.message ||
        "Credenciales incorrectas. Verifica tus datos.";

      mostrarAlerta("error", "Error de autenticación", mensaje);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100
                    dark:from-blue-900 dark:to-slate-800 px-4 py-8"
    >
      {/* Botón de tema */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {showBackButton && (
          <button
            onClick={() => navigate("/iniciosesion")}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver
          </button>
        )}

        <div
          className="bg-white dark:bg-slate-900/95
                       border border-blue-500 dark:border-blue-400 rounded-2xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{config.icon}</div>
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-200 mb-2">
              {config.title}
            </h1>
            <p className="text-blue-600 dark:text-blue-400">
              {config.subtitle}
            </p>
          </div>

          {/* Google OAuth */}
          {allowGoogleLogin && (
            <>
              <div className="mb-6">
                <GoogleLoginButton
                  rol={userType}
                  texto="Continuar con Google"
                  fullWidth
                />
              </div>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-300 font-medium">
                    O con mis datos
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {config.fields.map((field) => (
              <div key={field.name}>
                <Label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  maxLength={field.maxLength}
                  aria-invalid={!!errors[field.name]}
                  aria-describedby={
                    errors[field.name] ? `${field.name}-error` : undefined
                  }
                  // className={`w-full  ${errors[field.name] ? "border-red-500 focus:ring-red-500" : ""}`}
                  // className={`w-full border ${
                  //   errors[field.name]
                  //     ? "border-red-500 focus:ring-red-500"
                  //     : "!border-blue-300 dark:!border-blue-500 !bg-white dark:!bg-slate-700 !text-gray-900 dark:!text-white"
                  // }`}

                  className={`w-full border ${
                    errors[field.name]
                      ? "border-red-500 focus:ring-red-500"
                      : "!border-blue-300 dark:!border-blue-500 !bg-white dark:!bg-slate-700 !text-gray-900 dark:!text-white [&::-webkit-calendar-picker-indicator]:opacity-90 dark:[&::-webkit-calendar-picker-indicator]:invert dark:[&::-webkit-calendar-picker-indicator]:opacity-70"
                  }`}
                />
                {errors[field.name] && (
                  <p
                    id={`${field.name}-error`}
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}

            <Button
              type="submit"
              disabled={loading}
              className="w-full !bg-blue-950 dark:!bg-blue-800"
              variant="primary"
            >
              {loading ? "Verificando..." : "Iniciar Sesión"}
            </Button>
          </form>

          {/* Link a registro */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              ¿No tienes cuenta?{" "}
              <button
                onClick={() => {
                  const routes = {
                    admin: "/registeradmin",
                    ciudadano: "/registerciudadano",
                    candidato: "/registercandidato",
                  };
                  navigate(routes[userType] || "/registrarse");
                }}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
