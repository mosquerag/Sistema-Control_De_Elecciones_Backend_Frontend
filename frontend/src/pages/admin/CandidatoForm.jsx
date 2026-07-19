/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: CandidatoForm.jsx
 * UBICACIÓN: /frontend/src/pages/admin/CandidatoForm.jsx
 * ═══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import Label from "@/components/common/Label";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Select from "@/components/common/Select";
import { getEleccionesActivas } from "@/api/elecciones";
import { mostrarAlerta, manejarErrorApi, toastExito } from "@/utils/alertas";
import ImageUpload from "@/components/common/ImageUpload";

export default function CandidatoForm({ candidato, onSubmit, onCancel }) {
  const [elecciones, setElecciones] = useState([]);
  const [loadingElecciones, setLoadingEl] = useState(true);
  const [previewImage, setPreviewImage] = useState(
    candidato?.fotoPerfil || null,
  );

  const [formData, setFormData] = useState({
    cedula: candidato?.cedula || "",
    nombre: candidato?.nombre || "",
    partido: candidato?.partido || "",
    propuestas: candidato?.propuestas || "",
    idEleccion: candidato?.idEleccion?._id || candidato?.idEleccion || "",
    fotoPerfil: candidato?.fotoPerfil || "",
  });

  useEffect(() => {
    if (candidato) {
      setFormData({
        cedula: candidato.cedula || "",
        nombre: candidato.nombre || "",
        partido: candidato.partido || "",
        propuestas: candidato.propuestas || "",
        idEleccion: candidato.idEleccion?._id || candidato.idEleccion || "",
        fotoPerfil: candidato.fotoPerfil || "",
      });
      // setPreviewImage(candidato.fotoPerfil || null);
      if (candidato.fotoPerfil) {
        setPreviewImage(candidato.fotoPerfil);
      }
    } else {
      setFormData({
        cedula: "",
        nombre: "",
        partido: "",
        propuestas: "",
        idEleccion: "",
        fotoPerfil: "",
      });
      setPreviewImage(null);
    }
  }, [candidato]);

  useEffect(() => {
    getEleccionesActivas()
      .then((r) => {
        const data = r.data?.data || r.data || [];
        setElecciones(Array.isArray(data) ? data : []);
      })
      .catch((err) => manejarErrorApi(err, "Error al cargar las elecciones"))
      .finally(() => setLoadingEl(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (!file) return;

      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        mostrarAlerta(
          "warning",
          "Formato inválido",
          "Solo se permiten imágenes JPG, PNG, GIF o WEBP",
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        mostrarAlerta(
          "warning",
          "Imagen muy grande",
          "La imagen no debe superar 5MB",
        );
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [name]: reader.result }));
        setPreviewImage(reader.result);
        toastExito("Imagen cargada correctamente");
      };
      reader.onerror = () =>
        mostrarAlerta(
          "error",
          "Error al cargar imagen",
          "Intenta con otra imagen",
        );
      reader.readAsDataURL(file);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.cedula ||
      !formData.nombre ||
      !formData.partido ||
      !formData.propuestas ||
      !formData.idEleccion
    ) {
      mostrarAlerta(
        "warning",
        "Campos incompletos",
        "Por favor completa todos los campos obligatorios",
      );
      return;
    }
    if (!/^\d{11}$/.test(formData.cedula)) {
      mostrarAlerta(
        "warning",
        "Cédula inválida",
        "La cédula debe tener exactamente 11 dígitos",
      );
      return;
    }
    if (!formData.fotoPerfil) {
      mostrarAlerta(
        "warning",
        "Foto requerida",
        "Debes seleccionar una foto de perfil",
      );
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombre">
            Nombre <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            placeholder="Ej: Juan Pérez"
          />
        </div>
        <div>
          <Label htmlFor="cedula">
            Cédula <span className="text-red-500">*</span>
          </Label>
          <Input
            id="cedula"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
            required
            placeholder="11 dígitos"
            maxLength={11}
          />
        </div>
        <div>
          <Label htmlFor="partido">
            Partido <span className="text-red-500">*</span>
          </Label>
          <Input
            id="partido"
            name="partido"
            value={formData.partido}
            onChange={handleChange}
            required
            placeholder="Ej: Partido Democrático"
          />
        </div>
        <div>
          <Label htmlFor="idEleccion">
            Elección <span className="text-red-500">*</span>
          </Label>
          {loadingElecciones ? (
            <p className="text-sm text-gray-500 py-2.5">
              Cargando elecciones...
            </p>
          ) : (
            <>
              <Select
                id="idEleccion"
                name="idEleccion"
                value={formData.idEleccion}
                onChange={handleChange}
                required
                options={[
                  { value: "", label: "-- Seleccione una elección --" },
                  ...elecciones.map((e) => ({ value: e._id, label: e.titulo })),
                ]}
              />
              {elecciones.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠ No hay elecciones activas. Crea una primero.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <ImageUpload
            name="fotoPerfil"
            value={previewImage}
            onChange={(e) => handleChange(e)} 
            required
            label="Foto de Perfil"
            onError={(msg) => mostrarAlerta("warning", "Imagen inválida", msg)}
          />
        </div>
        {/* Propuestas */}
        <div>
          <Label htmlFor="propuestas">
            Propuestas <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="propuestas"
            name="propuestas"
            value={formData.propuestas}
            onChange={handleChange}
            rows={4}
            required
            placeholder="Escribe las propuestas del candidato aquí..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {candidato ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
