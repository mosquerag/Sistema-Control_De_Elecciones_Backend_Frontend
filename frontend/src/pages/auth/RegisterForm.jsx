/**
 * ARCHIVO: RegisterForm.jsx
 * UBICACIÓN: /frontend/src/pages/auth/RegisterForm.jsx
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Label from "@/components/common/Label";
import ThemeToggle from "@/context/ThemeToggle";
import { getEleccionesActivas } from "@/api/elecciones";
import { mostrarAlerta, toastExito, toastAdvertencia } from "@/utils/alertas";
import ImageUpload from "@/components/common/ImageUpload";
import { Crown } from "lucide-react";
import { Country, State, City } from "country-state-city";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";

const VALIDATORS = {
  nombre: (v) => {
    if (!v || v.trim().length < 3)
      return "El nombre debe tener al menos 3 caracteres";
    if (v.trim().length > 100)
      return "El nombre no puede exceder 100 caracteres";
    return null;
  },
  cedula: (v) => {
    if (!v) return "La cédula es obligatoria";
    if (!/^\d{11}$/.test(v.trim()))
      return "La cédula debe tener exactamente 11 dígitos numéricos";
    return null;
  },
  email: (v) => {
    if (!v) return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
      return "Ingresa un email válido";
    return null;
  },
  password: (v) => {
    if (!v) return "La contraseña es obligatoria";
    if (v.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    if (v.length > 128) return "La contraseña no puede exceder 128 caracteres";
    return null;
  },
  confirmPassword: (v, formData) => {
    if (!v) return "Debes confirmar tu contraseña";
    if (v !== formData.password) return "Las contraseñas no coinciden";
    return null;
  },
  fechaNacimiento: (v, _formData, field) => {
    if (field.required && !v) return "La fecha de nacimiento es obligatoria";
    if (v) {
      const fecha = new Date(v);
      if (isNaN(fecha.getTime())) return "Fecha inválida";
      const hoy = new Date();
      let edad = hoy.getFullYear() - fecha.getFullYear();
      const mes = hoy.getMonth() - fecha.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) edad--;
      if (edad < 18) return "Debes ser mayor de 18 años para registrarte";
    }
    return null;
  },
  partido: (v) => {
    if (!v || v.trim().length < 2)
      return "El nombre del partido es obligatorio";
    return null;
  },
  propuestas: (v) => {
    if (!v || v.trim().length < 10)
      return "Las propuestas deben tener al menos 10 caracteres";
    return null;
  },
  idEleccion: (v) => {
    if (!v) return "Debes seleccionar una elección";
    return null;
  },
  telefono: (v) => {
    if (!v) return "El teléfono es obligatorio";
    if (!isValidPhoneNumber(v))
      return "Número de teléfono inválido para el país seleccionado";
    return null;
  },
};

const validateField = (name, value, formData, field) => {
  if (!field.required && (!value || value === "")) return null;
  const validator = VALIDATORS[name];
  if (!validator) return null;
  return validator(value, formData, field);
};

const imageToBase64 = (file) =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo debe ser una imagen (JPG, PNG, WEBP)"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("La imagen no puede superar 5MB"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Error al leer la imagen"));
    reader.readAsDataURL(file);
  });

// const getFlagEmoji = (isoCode) => {
//   if (!isoCode) return "";
//   return isoCode
//     .toUpperCase()
//     .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
// };

const RegisterForm = ({
  userType,
  registerFunction,
  showBackButton = true,
  allowGoogleLogin = false,
  isModal = false,
  onSuccess,
  onCancel,
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [elecciones, setElecciones] = useState([]);

  const [paises, setPaises] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [paisSel, setPaisSel] = useState("");
  const [provinciaSel, setProvSel] = useState("");

  const [paisDropdownOpen, setPaisDropdownOpen] = useState(false);
  const [paisSearchTerm, setPaisSearchTerm] = useState("");
  const paisDropdownRef = useRef(null);

  const config = userType;

  const paisSeleccionado = paises.find((p) => p.isoCode === paisSel);
  const paisesFiltrados = paises.filter((p) =>
    p.name.toLowerCase().includes(paisSearchTerm.toLowerCase()),
  );

  useEffect(() => {
    const initial = {};
    config.fields?.forEach((f) => {
      initial[f.name] = "";
    });
    setFormData(initial);
    setErrors({});
    setPreviewImg(null);
  }, [config]);

  useEffect(() => {
    const hasEleccionField = config.fields?.some(
      (f) => f.type === "select-elecciones",
    );
    if (!hasEleccionField) return;
    getEleccionesActivas()
      // .then((res) => setElecciones(res.data || []))
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setElecciones(Array.isArray(data) ? data : []);
      })
      .catch(() => setElecciones([]));
  }, [config]);

  useEffect(() => {
    setPaises(Country.getAllCountries());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        paisDropdownRef.current &&
        !paisDropdownRef.current.contains(e.target)
      ) {
        setPaisDropdownOpen(false);
        setPaisSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = async (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (!file) return;
      try {
        const base64 = await imageToBase64(file);
        setFormData((prev) => ({ ...prev, [name]: base64 }));
        setPreviewImg(base64);
        toastExito("Imagen cargada correctamente");
      } catch (err) {
        toastAdvertencia(err.message);
        e.target.value = "";
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateAll = () => {
    const newErrors = {};
    let firstError = null;

    for (const field of config.fields) {
      if (field.type === "file") {
        if (field.required && !formData[field.name]) {
          newErrors[field.name] = "La foto de perfil es obligatoria";
          if (!firstError) firstError = newErrors[field.name];
        }
        continue;
      }
      if (field.name === "confirmPassword") {
        const err = VALIDATORS.confirmPassword(
          formData.confirmPassword,
          formData,
        );
        if (err) {
          newErrors.confirmPassword = err;
          if (!firstError) firstError = err;
        }
        continue;
      }
      const err = validateField(
        field.name,
        formData[field.name],
        formData,
        field,
      );
      if (err) {
        newErrors[field.name] = err;
        if (!firstError) firstError = err;
      }
    }

    setErrors(newErrors);
    if (firstError) {
      mostrarAlerta("error", "Campo inválido", firstError);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    try {
      const dataToSend = { ...formData };
      delete dataToSend.confirmPassword;
      Object.keys(dataToSend).forEach((k) => {
        if (typeof dataToSend[k] === "string" && k !== "fotoPerfil") {
          dataToSend[k] = dataToSend[k].trim();
        }
      });

      await registerFunction(dataToSend);
      mostrarAlerta(
        "success",
        "¡Registro exitoso!",
        "Tu cuenta ha sido creada. Espera la aprobación de un administrador.",
        3500,
      );

      if (isModal && onSuccess) {
        onSuccess();
        return;
      }
      setTimeout(() => {
        navigate(config.successRoute || "/iniciosesion");
      }, 2000);
    } catch (error) {
      const mensaje =
        error?.response?.data?.message ||
        error?.message ||
        "Error al registrarse. Intenta de nuevo.";
      mostrarAlerta("error", "Error al registrarse", mensaje);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const error = errors[field.name];
    // Textarea
    if (field.type === "textarea") {
      return (
        <div
          key={field.name}
          className={field.fullWidth ? "col-span-full" : ""}
        >
          <Label
            htmlFor={field.name}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <textarea
            id={field.name}
            name={field.name}
            rows={field.rows || 4}
            value={formData[field.name] || ""}
            onChange={handleChange}
            required={field.required}
            placeholder={field.placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? `${field.name}-error` : undefined}
            className={`w-full px-4 py-2.5 text-sm rounded-xl border transition-all duration-200
              !border-blue-300 dark:!border-blue-500 !bg-white dark:!bg-slate-700 !text-gray-900 dark:!text-white
              focus:outline-none focus:ring-2
              ${
                error
                  ? "border-red-500 focus:ring-red-300 dark:focus:ring-red-800"
                  : "border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900"
              }`}
          />
          {error && (
            <p
              id={`${field.name}-error`}
              role="alert"
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              ⚠ {error}
            </p>
          )}
        </div>
      );
    }
    // Select de elecciones
    if (field.type === "select-elecciones") {
      return (
        <div key={field.name}>
          <Label
            htmlFor={field.name}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <select
            id={field.name}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleChange}
            required={field.required}
            aria-invalid={!!error}
            className={`w-full px-4 py-2.5 text-sm rounded-xl border transition-all duration-200
              bg-white dark:bg-slate-800
              text-slate-800 dark:text-slate-100
              focus:outline-none focus:ring-2
              ${
                error
                  ? "border-red-500 focus:ring-red-300 dark:focus:ring-red-800"
                  : " !border-blue-300 dark:!border-blue-500 !bg-white dark:!bg-slate-700 !text-gray-900 dark:!text-white"
              }`}
          >
            <option value="">Selecciona una elección </option>
            {elecciones.map((e) => (
              <option key={e._id} value={e._id}>
                {e.titulo}
              </option>
            ))}
          </select>
          {elecciones.length === 0 && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              ⚠ No hay elecciones activas disponibles
            </p>
          )}
          {error && (
            <p
              id={`${field.name}-error`}
              role="alert"
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              ⚠ {error}
            </p>
          )}
        </div>
      );
    }
    if (field.type === "file") {
      return (
        <div key={field.name} className="col-span-full">
          <ImageUpload
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            disabled={loading}
            label={field.label}
            required={field.required}
            accept={field.accept}
            onError={(msg) => toastAdvertencia(msg)}
          />
          {error && (
            <p
              role="alert"
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              ⚠ {error}
            </p>
          )}
        </div>
      );
    }

    if (field.type === "select-pais-ciudad") {
      return (
        <div
          key={field.name}
          className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* País */}
          {/* País */}
          <div className="relative" ref={paisDropdownRef}>
            <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              País <span className="text-red-500">*</span>
            </Label>

            <button
              type="button"
              onClick={() => setPaisDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-xl border !border-blue-300 dark:!border-blue-500 !bg-white dark:!bg-slate-700 !text-gray-900 dark:!text-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <span className="flex items-center gap-2 truncate">
                {paisSel ? (
                  <>
                    <img
                      src={`https://flagcdn.com/24x18/${paisSel.toLowerCase()}.png`}
                      alt={paisSeleccionado?.name}
                      className="w-5 h-auto rounded-sm flex-shrink-0"
                    />
                    {paisSeleccionado?.name}
                  </>
                ) : (
                  <span className="text-gray-400">
                    Selecciona un país 
                  </span>
                )}
              </span>
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {paisDropdownOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-500 rounded-xl shadow-lg max-h-64 overflow-hidden flex flex-col">
                <input
                  type="text"
                  value={paisSearchTerm}
                  onChange={(e) => setPaisSearchTerm(e.target.value)}
                  placeholder="Buscar país..."
                  autoFocus
                  className="m-2 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
                <ul className="overflow-y-auto flex-1">
                  {paisesFiltrados.length === 0 && (
                    <li className="px-4 py-2 text-sm text-gray-400">
                      Sin resultados
                    </li>
                  )}
                  {paisesFiltrados.map((p) => (
                    <li
                      key={p.isoCode}
                      onClick={() => {
                        setPaisSel(p.isoCode);
                        setProvSel("");
                        setCiudades([]);
                        setFormData((prev) => ({
                          ...prev,
                          pais: p.name,
                          municipio: "",
                        }));
                        setProvincias(State.getStatesOfCountry(p.isoCode));
                        setPaisDropdownOpen(false);
                        setPaisSearchTerm("");
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/40 text-gray-800 dark:text-white"
                    >
                      <img
                        src={`https://flagcdn.com/24x18/${p.isoCode.toLowerCase()}.png`}
                        alt={p.name}
                        className="w-5 h-auto rounded-sm flex-shrink-0"
                      />
                      <span className="truncate">{p.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Municipio/Ciudad */}
          <div>
            <Label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Municipio Departamento <span className="text-red-500">*</span>
            </Label>
            <select
              value={formData.municipio || ""}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, municipio: e.target.value }));
                if (errors.municipio)
                  setErrors((prev) => ({ ...prev, municipio: null }));
              }}
              disabled={!paisSel}
              className="w-full px-4 py-2.5 text-sm rounded-xl border !border-blue-300 dark:!border-blue-500 !bg-white dark:!bg-slate-700 !text-gray-900 dark:!text-white focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            >
              <option value="">Selecciona municipio o departamento</option>
              {provincias.map((c) => (
                <option key={c.isoCode} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            {!paisSel && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                Selecciona primero un país
              </p>
            )}
            {errors.municipio && (
              <p
                role="alert"
                className="mt-1 text-xs text-red-600 dark:text-red-400"
              >
                ⚠ {errors.municipio}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (field.type === "phone") {
      return (
        <div key={field.name}>
          <Label
            htmlFor={field.name}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <PhoneInput
            international
            defaultCountry="DO"
            flags={flags}
            value={formData[field.name] || ""}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, [field.name]: value || "" }));
              if (errors[field.name])
                setErrors((prev) => ({ ...prev, [field.name]: null }));
            }}
            className={`phone-input-custom px-2 ${error ? "phone-input-error" : ""}`}
          />
          {error && (
            <p
              role="alert"
              className="mt-1 text-xs text-red-600 dark:text-red-400"
            >
              ⚠ {error}
            </p>
          )}
        </div>
      );
    }

    // Input normal
    return (
      <div key={field.name}>
        <Label
          htmlFor={field.name}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
          {!field.required && (
            <span className="text-xs text-slate-400 ml-1">(opcional)</span>
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
          error={error}
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
      </div>
    );
  };
  // Layout modal
  if (isModal) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.fields?.map(renderField)}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-blue-700">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="primary" loading={loading}>
            {loading ? "Registrando..." : "Registrar"}
          </Button>
        </div>
      </form>
    );
  }

  // Layout página completa
  return (
    <div
      className="min-h-screen flex items-center justify-center
                    bg-gradient-to-br from-blue-100 to-indigo-100   dark:from-blue-900 dark:to-slate-800
                    px-4 py-8"
    >
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl">
        {showBackButton && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300
                       hover:text-slate-800 dark:hover:text-white transition-colors"
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
                       border border-blue-500 dark:border-blue-400
                        rounded-2xl shadow-xl p-6 md:p-8"
        >
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">{config.icon}</div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-200 mb-1">
              Registro {config.title}
            </h1>
            {config.description && (
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {config.description}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {config.fields?.map(renderField)}
            </div>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full !bg-blue-950 dark:!bg-blue-800"
              size="lg"
            >
              {loading ? "Registrando..." : "Crear Cuenta"}
            </Button>
          </form>
          {config.showLoginLink && (
            <p className="text-center mt-5 text-sm text-slate-500 dark:text-slate-400">
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => {
                  const LOGIN_ROUTES = {
                    admin: "/loginadmin",
                    ciudadano: "/loginciudadano",
                    candidato: "/logincandidato",
                  };
                  navigate(LOGIN_ROUTES[config.id] || "/iniciosesion");
                }}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Inicia sesión aquí
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
