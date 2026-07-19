/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: CiudadanoForm.jsx
 * UBICACIÓN: /frontend/src/pages/admin/CiudadanoForm.jsx
 * ═══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Label from "@/components/common/Label";
import Select from "@/components/common/Select";
import { mostrarAlerta } from "@/utils/alertas";

export default function CiudadanoForm({ ciudadano, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    // ── Editables por el admin 
    nombre: "",
    cedula: "",
    email: "",
    fechaNacimiento: "",
    nacionalidad: "Dominicana",
    // ── Solo en edición
    activo: true,
    estado: "pendiente_aprobacion",
    // ── Solo lectura (ciudadano los llena) 
    telefono: "",
    municipio: "",
    direccion: "",
    fotoPerfil: "",
    edad: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (ciudadano) {
      setFormData({
        nombre: ciudadano.nombre || "",
        cedula: ciudadano.cedula || "",
        email: ciudadano.email || "",
        fechaNacimiento: ciudadano.fechaNacimiento
          ? new Date(ciudadano.fechaNacimiento).toISOString().split("T")[0]
          : "",
        nacionalidad: ciudadano.nacionalidad || "Dominicana",
        activo: ciudadano.activo ?? true,
        estado: ciudadano.estado || "pendiente_aprobacion",
        telefono: ciudadano.telefono || "",
        municipio: ciudadano.municipio || "",
        direccion: ciudadano.direccion || "",
        fotoPerfil: ciudadano.fotoPerfil || "",
        edad: ciudadano.edad || "",
      });
    } else {
      setFormData({
        nombre: "",
        cedula: "",
        email: "",
        fechaNacimiento: "",
        nacionalidad: "Dominicana",
        activo: true,
        estado: "pendiente_aprobacion",
        telefono: "",
        municipio: "",
        direccion: "",
        fotoPerfil: "",
        edad: "",
      });
    }
  }, [ciudadano]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name === "activo" ? value === "true" : value;
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim() || formData.nombre.trim().length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres";
    }
    if (!formData.cedula) {
      newErrors.cedula = "La cédula es obligatoria";
    } else if (!/^\d{11}$/.test(formData.cedula)) {
      newErrors.cedula = "La cédula debe tener exactamente 11 dígitos";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingresa un email válido";
    }
    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    } else {
      const fecha = new Date(formData.fechaNacimiento);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fecha.getFullYear();
      const mes = hoy.getMonth() - fecha.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) edad--;
      if (edad < 18) {
        newErrors.fechaNacimiento = "El ciudadano debe ser mayor de 18 años";
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      mostrarAlerta("warning", "Campos inválidos", Object.values(newErrors)[0]);
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Calcular edad real antes de enviar
    const hoy = new Date();
    const nacimiento = new Date(formData.fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const cumpleEsteAnio =
      hoy.getMonth() > nacimiento.getMonth() ||
      (hoy.getMonth() === nacimiento.getMonth() &&
        hoy.getDate() >= nacimiento.getDate());
    const edadReal = cumpleEsteAnio ? edad : edad - 1;

    if (ciudadano) {
      // Modo edición — campos editables + control de estado
      onSubmit({
        nombre: formData.nombre.trim(),
        cedula: formData.cedula,
        // email: formData.email,
        fechaNacimiento: formData.fechaNacimiento,
        nacionalidad: formData.nacionalidad,
        edad: edadReal,
        activo: formData.activo,
        estado: formData.estado,
      });
    } else {
      // Modo creación — solo lo que el backend espera
      onSubmit({
        nombre: formData.nombre.trim(),
        cedula: formData.cedula,
        email: formData.email,
        fechaNacimiento: formData.fechaNacimiento,
        nacionalidad: formData.nacionalidad,
        edad: edadReal,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      {/* ── Nombre y Cédula ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombre-c">
            Nombre completo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombre-c"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            placeholder="Ej: María García"
            error={errors.nombre}
          />
        </div>
        <div>
          <Label htmlFor="cedula-c">
            Cédula <span className="text-red-500">*</span>
          </Label>
          <Input
            id="cedula-c"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
            required
            placeholder="11 dígitos"
            maxLength={11}
            error={errors.cedula}
          />
        </div>
      </div>

      {/* ── Email y Fecha de Nacimiento  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fecha-c">
            Fecha de Nacimiento <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fecha-c"
            name="fechaNacimiento"
            type="date"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            required
            max={
              new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                .toISOString()
                .split("T")[0]
            }
            error={errors.fechaNacimiento}
          />
        </div>
         <div>
          <Label htmlFor="nacionalidad-c">Nacionalidad</Label>
          <Input
            id="nacionalidad-c"
            name="nacionalidad"
            value={formData.nacionalidad}
            onChange={handleChange}
            placeholder="Ej: Dominicana"
          />
        </div>
      </div>

     

      {/* ── Estado y Activo — solo en edición  */}
      {ciudadano && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="estado-c">Estado</Label>
            <Select
              id="estado-c"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              options={[
                { value: "activo",               label: "Activo" },
                { value: "bloqueado",            label: "Bloqueado" },
                { value: "archivado",            label: "Archivado" },
              ]}
            />
          </div>
          <div>
            <Label htmlFor="activo-c">Acceso al sistema</Label>
            <Select
              id="activo-c"
              name="activo"
              value={String(formData.activo)}
              onChange={handleChange}
              options={[
                { value: "true",  label: "Habilitado" },
                { value: "false", label: "Deshabilitado" },
              ]}
            />
          </div>
        </div>
      )}

      {/* ── Datos completados por el ciudadano — solo lectura ── */}
      {ciudadano && (
        <div className="border-t border-gray-200 dark:border-slate-700 pt-4 space-y-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
            Información completada por el ciudadano (solo lectura)
          </p>

          {/* Foto de perfil */}
          <div className="flex items-center gap-4">
            {formData.fotoPerfil ? (
              <>
                <img
                  src={formData.fotoPerfil}
                  alt="Foto de perfil"
                  // className="w-16 h-16 rounded-full object-cover border-2 border-blue-300 flex-shrink-0"
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex-shrink-0 object-cover border-2 border-green-400 dark:border-green-500"
                />
                <span className="text-sm text-gray-500 dark:text-slate-400">
                  Foto de perfil del ciudadano
                </span>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center flex-shrink-0">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-gray-400"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-400 dark:text-slate-500">
                  El ciudadano aún no ha subido foto
                </span>
              </>
            )}
          </div>

          {/* Teléfono, Municipio, Dirección */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Email</Label>
              <Input value={formData.email} disabled onChange={() => {}} placeholder="Sin información" />
            </div>
            <div>
              <Label>Edad calculada</Label>
              <Input
                value={formData.edad ? `${formData.edad} años` : "Sin información"}
                disabled
                onChange={() => {}}
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                value={formData.telefono}
                disabled
                onChange={() => {}}
                placeholder="Sin información"
              />
            </div>
            <div>
              <Label>Municipio</Label>
              <Input
                value={formData.municipio}
                disabled
                onChange={() => {}}
                placeholder="Sin información"
              />
            </div>
             <div>
            <Label>Dirección</Label>
            <Input
              value={formData.direccion}
              disabled
              onChange={() => {}}
              placeholder="Sin información"
            />
          </div>
            
          </div>

         
        </div>
      )}

      {/* ── Botones ─────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {ciudadano ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}