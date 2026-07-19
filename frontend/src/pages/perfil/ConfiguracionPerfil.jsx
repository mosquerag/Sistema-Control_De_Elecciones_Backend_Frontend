import { useState } from "react";
import { Lock, Save, Eye, EyeOff, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { updatePerfil, cambiarPassword, updateFotoPerfil } from "@/api/perfil";
import {
  mostrarAlerta,
  confirmarAccion,
  manejarErrorApi,
} from "@/utils/alertas";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Label from "@/components/common/Label";
import Textarea from "@/components/common/Textarea";
import Avatar from "@/components/common/Avatar";

// ─────────────────────────────────────────────────────────────
// HELPER — campos editables según rol
// ─────────────────────────────────────────────────────────────
const getCamposPermitidos = (rol) => {
  const base = ["nombre", "email", "telefono", "direccion", "municipio"];
  if (rol === "candidato") return [...base, "propuestas"];
  return base;
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────
export function ConfiguracionPerfil({ onClose }) {
  const { user, updateUser } = useAuth();

  // ── Estados generales ──────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");

  // ── Estado formulario perfil ───────────────────────────────
  const [formData, setFormData] = useState({
    nombre: user?.nombre || "",
    email: user?.email || "",
    telefono: user?.telefono || "",
    direccion: user?.direccion || "",
    municipio: user?.municipio || "",
    partido: user?.partido || "",
    propuestas: user?.propuestas || "",
  });
  const [originalData, setOriginalData] = useState(formData);
  const [errores, setErrores] = useState({});

  // ── Estado foto ────────────────────────────────────────────
  const [previewFoto, setPreviewFoto] = useState(user?.fotoPerfil || null);
  const [fotoBase64, setFotoBase64] = useState(null);

  // hasChanges — true si cambiaron datos O si hay foto nueva
  const hasChanges =
    JSON.stringify(formData) !== JSON.stringify(originalData) ||
    fotoBase64 !== null;

  // ── Estado password ────────────────────────────────────────
  const [passwordData, setPasswordData] = useState({
    passwordActual: "",
    passwordNuevo: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState({
    actual: false,
    nuevo: false,
    confirmar: false,
  });

  // ── Google ─────────────────────────────────────────────────
  const esGoogle = user?.proveedor === "google" || user?.esGoogle === true;
  const camposPermitidos = getCamposPermitidos(user?.rol);

  // ─────────────────────────────────────────────────────────
  // HANDLERS — Foto
  // ─────────────────────────────────────────────────────────
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      mostrarAlerta(
        "error",
        "Archivo muy grande",
        "La imagen no debe superar 5MB",
      );
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoBase64(reader.result);
      setPreviewFoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ─────────────────────────────────────────────────────────
  // HANDLERS — Perfil
  // ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: "" }));
  };

  const validarPerfil = () => {
    const e = {};
    if (!formData.nombre?.trim()) e.nombre = "El nombre es obligatorio";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Email inválido";
    if (formData.telefono && !/^\+[1-9]\d{7,14}$/.test(formData.telefono))
      e.telefono = "El teléfono debe tener un formato internacional válido";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmitPerfil = (e) => {
    e.preventDefault();
    if (!validarPerfil()) return;

    // ── Validar foto obligatoria si el usuario no tiene una aún ──
    if (!previewFoto && !fotoBase64) {
      mostrarAlerta(
        "error",
        "Foto de perfil requerida",
        "Debes subir una foto de perfil antes de guardar los cambios.",
      );
      return;
    }

    confirmarAccion(
      "¿Guardar cambios?",
      "¿Estás seguro de que deseas actualizar tu información?",
      async () => {
        try {
          setLoading(true);

          // ── Guardar foto si hay una nueva seleccionada ──
          if (fotoBase64) {
            await updateFotoPerfil(fotoBase64);
            updateUser({ 
              fotoPerfil: fotoBase64,
              perfilPendiente: false, 
             });
            setFotoBase64(null);
          }

          // ── Guardar datos si hubo cambios en el formulario ──
          if (JSON.stringify(formData) !== JSON.stringify(originalData)) {
            const dataToSend = {
              nombre: formData.nombre,
              telefono: formData.telefono || null,
              direccion: formData.direccion || null,
              municipio: formData.municipio || null,
            };
            if (formData.email !== user?.email)
              dataToSend.email = formData.email;
            if (user?.rol === "candidato")
              dataToSend.propuestas = formData.propuestas;

            const response = await updatePerfil(dataToSend);
            // updateUser(
            //   response.data?.usuario || response.usuario || response.data,
            //   perfilPendiente: false,
            // );
            updateUser({
              ...(response.data?.usuario || response.usuario || response.data),
              perfilPendiente: false,
            });
            setOriginalData(formData);
          }
          mostrarAlerta(
            "success",
            "Perfil actualizado",
            "Tu información ha sido actualizada exitosamente",
          );
          setTimeout(() => onClose(), 2000);
        } catch (error) {
          manejarErrorApi(error, "No se pudo actualizar el perfil");
        } finally {
          setLoading(false);
        }
      },
    );
  };

  // ─────────────────────────────────────────────────────────
  // HANDLERS — Password
  // ─────────────────────────────────────────────────────────
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: "" }));
  };

  const validarPassword = () => {
    const e = {};
    if (!passwordData.passwordActual)
      e.passwordActual = "Ingresa tu contraseña actual";
    if (!passwordData.passwordNuevo)
      e.passwordNuevo = "Ingresa la nueva contraseña";
    else if (passwordData.passwordNuevo.length < 6)
      e.passwordNuevo = "Mínimo 6 caracteres";
    if (passwordData.passwordNuevo !== passwordData.confirmPassword)
      e.confirmPassword = "Las contraseñas no coinciden";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();
    if (!validarPassword()) return;

    confirmarAccion(
      "¿Cambiar contraseña?",
      "¿Estás seguro de que deseas cambiar tu contraseña?",
      async () => {
        try {
          setLoading(true);
          await cambiarPassword({
            passwordActual: passwordData.passwordActual,
            passwordNuevo: passwordData.passwordNuevo,
          });
          mostrarAlerta(
            "success",
            "Contraseña actualizada",
            "Tu contraseña ha sido cambiada exitosamente",
          );
          setPasswordData({
            passwordActual: "",
            passwordNuevo: "",
            confirmPassword: "",
          });
          setTimeout(() => setActiveTab("perfil"), 2000);
        } catch (error) {
          manejarErrorApi(error, "No se pudo cambiar la contraseña");
        } finally {
          setLoading(false);
        }
      },
    );
  };

  // ─────────────────────────────────────────────────────────
  // HELPER UI
  // ─────────────────────────────────────────────────────────
  const tabClass = (tab) =>
    `flex-1 py-3 px-4 text-center text-sm font-medium transition-colors ${
      activeTab === tab
        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
    }`;

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Configuración de Cuenta"
      className="max-h-[90vh]"
      bodyClassName="p-0"
    >
      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 dark:border-slate-700 px-2">
        <button
          className={tabClass("perfil")}
          onClick={() => setActiveTab("perfil")}
        >
          Información
        </button>
        {!esGoogle && (
          <button
            className={tabClass("password")}
            onClick={() => setActiveTab("password")}
          >
            Contraseña
          </button>
        )}
      </div>

      {/* ── Contenido ──────────────────────────────────────── */}
      <div className="p-6 overflow-y-auto max-h-[60vh]">
        {/* ════════════════════════════════════════════════════
            TAB: INFORMACIÓN PERSONAL
        ════════════════════════════════════════════════════ */}
        {activeTab === "perfil" && (
          <form onSubmit={handleSubmitPerfil} className="space-y-4">
            {/* ── Foto de perfil ─────────────────────────── */}
            <div
              className="flex flex-col items-center gap-3 pb-4 border-b border-gray-200 dark:border-slate-700"
            >
              <div className="relative">
                <Avatar nombre={user?.nombre} foto={previewFoto} size="lg" />
                <label
                  htmlFor="foto-input"
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-full p-2 cursor-pointer transition-colors shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    id="foto-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click en la cámara para cambiar tu foto · PNG, JPG — máx 5MB
              </p>

              {/* Indicador de foto pendiente */}
              {fotoBase64 && (
                <p className="text-xs text-blue-500 dark:text-blue-400 font-medium">
                  ✓ Foto seleccionada — se guardará al hacer clic en "Guardar
                  Cambios"
                </p>
              )}
            </div>

            {/* Nombre */}
            <div className="grid grid-cols-2 gap-4">
              {" "}
              {camposPermitidos.includes("nombre") && (
                <div>
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    required
                  />
                  {errores.nombre && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errores.nombre}
                    </p>
                  )}
                </div>
              )}
              {/* Email */}
              {camposPermitidos.includes("email") && (
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    disabled={esGoogle}
                  />
                  {esGoogle && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      No puedes cambiar el email de una cuenta Google
                    </p>
                  )}
                  {errores.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errores.email}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Cédula — solo lectura */}
              {user?.cedula && (
                <div>
                  <Label htmlFor="cedula">
                    Cédula{" "}
                    <span className="text-xs text-gray-400">
                      (No modificable)
                    </span>
                  </Label>
                  <Input id="cedula" value={user.cedula} disabled />
                </div>
              )}{" "}
              <div>
                <Label htmlFor="rol">
                  Rol{" "}
                  <span className="text-xs text-gray-400">
                    (No modificable)
                  </span>
                </Label>
                <Input id="rol" value={user?.rol} disabled />
              </div>
            </div>

            {/* Rol + Estado — solo lectura */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estado">
                  Estado{" "}
                  <span className="text-xs text-gray-400">
                    (No modificable)
                  </span>
                </Label>
                <Input id="estado" value={user?.estado} disabled />
              </div>
              {camposPermitidos.includes("telefono") && (
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="8096789012"
                    maxLength={10}
                  />
                  {errores.telefono && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errores.telefono}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Teléfono + Municipio */}
            <div className="grid grid-cols-2 gap-4">
              {camposPermitidos.includes("municipio") && (
                <div>
                  <Label htmlFor="municipio">Municipio</Label>
                  <Input
                    id="municipio"
                    name="municipio"
                    value={formData.municipio}
                    onChange={handleChange}
                    placeholder="Santo Domingo"
                  />
                </div>
              )}
              {camposPermitidos.includes("direccion") && (
                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Calle Principal #123"
                  />
                </div>
              )}
            </div>

            {/* Dirección + Partido (candidatos) */}
            <div className="grid grid-cols-2 gap-4">
              {user?.rol === "candidato" && (
                <div>
                  <Label htmlFor="partido">Partido Político{" "}
                    <span className="text-xs text-gray-400">
                    (No modificar)
                  </span>
                  {/* <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    No se puede modificar
                  </p> */}
                  </Label>
                  <Input
                    id="partido"
                    name="partido"
                    value={formData.partido}
                    disabled
                  />
                  
                </div>
              )}

              {/* Propuestas — solo candidatos */}
              {camposPermitidos.includes("propuestas") && (
                <div>
                  <Label htmlFor="propuestas">Propuestas</Label>
                  <Textarea
                    id="propuestas"
                    name="propuestas"
                    value={formData.propuestas}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe tus propuestas de campaña..."
                  />
                </div>
              )}
            </div>

            {/* ── Botones ────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>

              {/* Guardar — solo si hay cambios en datos o foto */}
              <Button
                type="submit"
                variant="info"
                disabled={!hasChanges || loading}
                className=""
              >
                <Save className="w-4 h-4" />
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        )}

        {/* ════════════════════════════════════════════════════
            TAB: CAMBIAR CONTRASEÑA
        ════════════════════════════════════════════════════ */}
        {activeTab === "password" && !esGoogle && (
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            {/* Contraseña actual */}

            <div>
              <Label htmlFor="passwordActual">Contraseña Actual</Label>
              <div className="relative">
                <Input
                  id="passwordActual"
                  name="passwordActual"
                  type={showPass.actual ? "text" : "password"}
                  value={passwordData.passwordActual}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPass((p) => ({ ...p, actual: !p.actual }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 dark:text-gray-500
                             hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPass.actual ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errores.passwordActual && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errores.passwordActual}
                </p>
              )}
            </div>

            {/* Nueva contraseña */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="passwordNuevo">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="passwordNuevo"
                    name="passwordNuevo"
                    type={showPass.nuevo ? "text" : "password"}
                    value={passwordData.passwordNuevo}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPass((p) => ({ ...p, nuevo: !p.nuevo }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 dark:text-gray-500
                             hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPass.nuevo ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errores.passwordNuevo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errores.passwordNuevo}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Mínimo 6 caracteres
                </p>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPass.confirmar ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPass((p) => ({ ...p, confirmar: !p.confirmar }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 dark:text-gray-500
                             hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPass.confirmar ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errores.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errores.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="info"
                disabled={loading}
                className=""
              >
                <Lock className="w-4 h-4" />
                {loading ? "Cambiando..." : "Cambiar Contraseña"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
