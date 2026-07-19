/**
 * ARCHIVO: ForgotPassword.jsx
 * UBICACIÓN: /frontend/src/pages/auth/ForgotPassword.jsx
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Label from "@/components/common/Label";
import ThemeToggle from "@/context/ThemeToggle";
import { mostrarAlerta } from "@/utils/alertas";
import API from "@/api/axios";
import CountdownTimer from "@/context/CountdownTimer";

const ForgotPassword = () => {
  const navigate = useNavigate();
  //  Paso actual: 1 = verificar identidad, 2 = nueva contraseña, 3 = éxito
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [nombreUsuario, setNombre] = useState("");
  //  Paso 1
  const [cedula, setCedula] = useState("");
  const [email, setEmail] = useState("");
  //  Paso 2
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState({ nueva: false, confirmar: false });
  //  Errores
  const [errores, setErrores] = useState({});
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!cedula.trim()) errs.cedula = "La cédula es obligatoria";
    else if (!/^\d{11}$/.test(cedula.trim()))
      errs.cedula = "La cédula debe tener 11 dígitos";
    if (!email.trim()) errs.email = "El email es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = "Email inválido";

    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      return;
    }
    setErrores({});

    setLoading(true);
    try {
      const res = await API.post("/auth/verify-identity", {
        cedula: cedula.trim(),
        email: email.trim().toLowerCase(),
      });

      setResetToken(res.data.data.resetToken);
      setNombre(res.data.data.nombre);
      setTiempoInicio(Date.now());
      setPaso(2);
    } catch (error) {
      const data = error?.response?.data;
      const mensaje = data?.message || "Error al verificar identidad";

      if (data?.error === "RESET_BLOCKED") {
        mostrarAlerta(
          "warning",
          "Debes esperar 20 minutos para volver intentarlo",
          mensaje,
        );
      } else {
        mostrarAlerta("error", "No encontramos tu cuenta", mensaje);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // PASO 2: Cambiar contraseña
  // ─────────────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwordNueva) errs.passwordNueva = "Ingresa la nueva contraseña";
    else if (passwordNueva.length < 6)
      errs.passwordNueva = "Mínimo 6 caracteres";
    else if (passwordNueva.length > 128)
      errs.passwordNueva = "Máximo 128 caracteres";
    if (passwordNueva !== confirmPassword)
      errs.confirmPassword = "Las contraseñas no coinciden";

    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      return;
    }
    setErrores({});

    setLoading(true);
    try {
      await API.post("/auth/reset-password", {
        resetToken,
        passwordNueva,
        confirmPassword,
      });
      setPaso(3);
    } catch (error) {
      const mensaje =
        error?.response?.data?.message || "Error al cambiar la contraseña";
      mostrarAlerta("error", "Error", mensaje);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center
                    bg-gradient-to-br  from-blue-100 to-indigo-100
                    dark:from-blue-900 dark:to-slate-800
                    px-4 py-10"
    >
      {/* Botón tema */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Volver */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300
                     hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </button>

        <div
          className="bg-white dark:bg-slate-900/95   border border-blue-500 dark:border-blue-400
                        rounded-2xl shadow-xl p-6 md:p-8"
        >
          {/* PASO 1 — Verificar identidad */}
          {paso === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="text-5xl mb-3">🔐</div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                  ¿Olvidaste tu contraseña?
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ingresa tu cédula y email registrado para verificar tu
                  identidad
                </p>
              </div>

              <form
                onSubmit={handleVerifyIdentity}
                className="space-y-4"
                noValidate
              >
                <div>
                  <Label htmlFor="cedula">
                    Cédula <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cedula"
                    type="text"
                    value={cedula}
                    onChange={(e) => {
                      setCedula(e.target.value);
                      if (errores.cedula)
                        setErrores((p) => ({ ...p, cedula: null }));
                    }}
                    placeholder="11 dígitos"
                    maxLength={11}
                    error={errores.cedula}
                    className="!border-blue-300 dark:!border-blue-500 !bg-white dark:!bg-slate-700 !text-gray-900 dark:!text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errores.email)
                        setErrores((p) => ({ ...p, email: null }));
                    }}
                    placeholder="correo@ejemplo.com"
                    error={errores.email}
                    className="!border-blue-300 dark:!border-blue-500 !bg-white dark:!bg-slate-700 !text-gray-900 dark:!text-white"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="w-full !bg-blue-950 dark:!bg-blue-800"
                >
                  {loading ? "Verificando..." : "Verificar Identidad"}
                </Button>
              </form>
            </>
          )}

          {/* ══════════════════════════════════
              PASO 2 — Nueva contraseña
          ══════════════════════════════════ */}
          {paso === 2 && (
            <>
              <div className="text-center mb-8">
                <div className="text-5xl mb-3">🔑</div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                  Nueva Contraseña
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Hola <strong>{nombreUsuario}</strong>, ingresa tu nueva
                  contraseña
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  ⚠ Tienes 5 minutos para cambiar la contraseña
                </p>
                <CountdownTimer tiempoInicio={tiempoInicio} />
              </div>

              <form
                onSubmit={handleResetPassword}
                className="space-y-4"
                noValidate
              >
                {/* Nueva contraseña */}
                <div>
                  <Label htmlFor="passwordNueva">
                    Nueva Contraseña <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="passwordNueva"
                      type={showPass.nueva ? "text" : "password"}
                      value={passwordNueva}
                      onChange={(e) => {
                        setPasswordNueva(e.target.value);
                        if (errores.passwordNueva)
                          setErrores((p) => ({ ...p, passwordNueva: null }));
                      }}
                      placeholder="Mínimo 6 caracteres"
                      error={errores.passwordNueva}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPass((p) => ({ ...p, nueva: !p.nueva }))
                      }
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPass.nueva ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <Label htmlFor="confirmPassword">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPass.confirmar ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errores.confirmPassword)
                          setErrores((p) => ({ ...p, confirmPassword: null }));
                      }}
                      placeholder="Repite tu nueva contraseña"
                      error={errores.confirmPassword}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPass((p) => ({ ...p, confirmar: !p.confirmar }))
                      }
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPass.confirmar ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  {/* <Button type="button" variant="secondary" onClick={() => setPaso(1)} disabled={loading} className="flex-1">
                    Volver
                  </Button> */}
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="w-full !bg-blue-950 dark:!bg-blue-800"
                  >
                    <Lock className="w-4 h-4" />
                    {loading ? "Cambiando..." : "Cambiar Contraseña"}
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* ══════════════════════════════════
              PASO 3 — Éxito
          ══════════════════════════════════ */}
          {paso === 3 && (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-2">
                ¡Contraseña actualizada!
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar
                sesión con tu nueva contraseña.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate("/iniciosesion")}
                className="w-full !bg-blue-950 dark:!bg-blue-800"
                size="lg"
              >
                Ir al Inicio de Sesión
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
