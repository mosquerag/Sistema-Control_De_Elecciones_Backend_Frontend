/**
 * ARCHIVO: RegisterAdministrador.jsx
 * UBICACIÓN: /frontend/src/pages/auth/RegisterAdministrador.jsx
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Label from "@/components/common/Label";
import ImageUpload from "@/components/common/ImageUpload";

const RegisterAdministrador = ({
  userType,
  registerFunction,
  showBackButton = false,
  isModal = false,
  usuarioEditar = null,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState(() => {
    const initialData = {};
    if (userType?.fields) {
      userType.fields.forEach((field) => {
        if (field.type === "date" && usuarioEditar?.[field.name]) {
          initialData[field.name] = new Date(usuarioEditar[field.name])
            .toISOString()
            .split("T")[0];
        } else {
          initialData[field.name] = usuarioEditar?.[field.name] || "";
        }
      });
    }
    return initialData;
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (usuarioEditar) {
      const updatedData = {};
      userType.fields.forEach((field) => {
        if (field.type === "date" && usuarioEditar[field.name]) {
          updatedData[field.name] = new Date(usuarioEditar[field.name])
            .toISOString()
            .split("T")[0];
        } else {
          updatedData[field.name] = usuarioEditar[field.name] || "";
        }
      });
      setFormData(updatedData);
    }
  }, [usuarioEditar, userType.fields]);

  const handleChange = (e) => {
    const { name, type, value } = e.target;

    if (type === "file") {
      // ✅ ImageUpload ya valida y convierte a base64 internamente,
      //    aquí solo guardamos el base64 que viene en e.target.value
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    for (const field of userType.fields) {
      if (
        usuarioEditar &&
        (field.name === "password" || field.name === "confirmPassword")
      ) {
        continue;
      }
      if (field.required && !formData[field.name]) {
        toast.error(`El campo ${field.label} es obligatorio`);
        return false;
      }
    }

    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const dataToSend = { ...formData };
      delete dataToSend.confirmPassword;

      if (usuarioEditar && !dataToSend.password) {
        delete dataToSend.password;
      }

      await registerFunction(dataToSend);

      toast.success(
        usuarioEditar
          ? "Usuario actualizado correctamente"
          : "Administrador creado correctamente",
      );

      if (isModal) {
        onSuccess?.();
      } else {
        navigate(userType.successRoute);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl w-full">
      {showBackButton && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 text-gray-600 hover:text-gray-800 dark:text-white transition"
        >
          ← Volver
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-start">
        {userType.fields.map((field) => {
          const isPasswordField =
            field.name === "password" || field.name === "confirmPassword";
          const isRequired =
            usuarioEditar && isPasswordField ? false : field.required;

          return (
            <div
              key={field.name}
              className={field.fullWidth ? "md:col-span-2" : ""}
            >
              {/* ── Label: ImageUpload tiene el suyo propio, no duplicar ── */}
              {field.type !== "file" && (
                <Label htmlFor={field.name}>
                  {field.label}{" "}
                  {isRequired && <span className="text-red-500">*</span>}
                  {usuarioEditar && isPasswordField && (
                    <span className="text-gray-500 text-sm ml-2">
                      (dejar en blanco para mantener la actual)
                    </span>
                  )}
                </Label>
              )}

              {/* ── Campo según tipo ── */}
              {field.type === "file" ? (
                <ImageUpload
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  disabled={loading}
                  label={field.label}
                  required={isRequired}
                  accept={field.accept}
                  onError={(msg) => toast.error(msg)}
                />
              ) : field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  rows={field.rows || 3}
                  className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={isRequired}
                  disabled={loading}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 justify-end pt-6 border-t mt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
        >
          {loading
            ? usuarioEditar
              ? "Actualizando..."
              : "Creando..."
            : usuarioEditar
              ? "Actualizar"
              : "Crear"}
        </Button>
      </div>
    </form>
  );
};

export default RegisterAdministrador;
