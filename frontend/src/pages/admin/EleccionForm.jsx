import { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Label from "@/components/common/Label";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Select from "@/components/common/Select";
import { getTiposEleccion } from "@/api/tiposElecciones";
import { mostrarAlerta, manejarErrorApi } from "@/utils/alertas";

export default function EleccionForm({ eleccion, onSubmit, onCancel }) {
  const [tiposEleccion, setTiposEleccion] = useState([]);

  // Leer fecha UTC correctamente para el input sin desfase de día
  const normalizarFechaParaInput = (fechaString) => {
    if (!fechaString) return "";
    try {
      const fecha = new Date(fechaString);
      const year = fecha.getUTCFullYear();
      const month = String(fecha.getUTCMonth() + 1).padStart(2, "0");
      const day = String(fecha.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  const [formData, setFormData] = useState({
    titulo: eleccion?.titulo || "",
    descripcion: eleccion?.descripcion || "",
    idTipoEleccion: eleccion?.idTipoEleccion?._id || "",
    fechaInicio: normalizarFechaParaInput(eleccion?.fechaInicio),
    fechaFin: normalizarFechaParaInput(eleccion?.fechaFin),
    activa: eleccion?.activa ?? true,
  });

  useEffect(() => {
    cargarTipos();
  }, []);

  const cargarTipos = async () => {
    try {
      const res = await getTiposEleccion();
      const data = res.data?.data || res.data || [];
      setTiposEleccion(Array.isArray(data) ? data : []);
    } catch (error) {
      manejarErrorApi(error, "Error al cargar tipos de elección");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones
    if (
      !formData.titulo ||
      !formData.idTipoEleccion ||
      !formData.fechaInicio ||
      !formData.fechaFin
    ) {
      mostrarAlerta(
        "warning",
        "Campos incompletos",
        "Por favor completa todos los campos obligatorios",
      );
      return;
    }

    if (formData.fechaFin < formData.fechaInicio) {
      mostrarAlerta(
        "error",
        "Fecha incorrecta",
        "La fecha de fin debe ser posterior a la fecha de inicio",
      );
      return;
    }

    const dataToSend = {
      ...formData,
      fechaInicio: formData.fechaInicio, // "2026-05-06" → backend: 2026-05-06T00:00:00.000Z
      fechaFin: formData.fechaFin, // "2026-05-06" → backend: 2026-05-06T23:59:59.999Z
    };

    onSubmit(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título y Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="titulo">
            Título de la Elección <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            placeholder="Ej: Elecciones Presidenciales 2026"
          />
        </div>
        <div>
          <Label htmlFor="idTipoEleccion">
            Tipo de Elección <span className="text-red-500">*</span>
          </Label>
          <Select
            id="idTipoEleccion"
            value={formData.idTipoEleccion}
            onChange={(e) => {
              setFormData({
                ...formData,
                idTipoEleccion: e.target.value,
              });
            }}
            options={[
              { value: "", label: "-- Selecciona un tipo --" },
              ...tiposEleccion
                .filter((tipo) => tipo.activa === true)
                .map((tipo) => ({
                  value: tipo._id,
                  label: tipo.nombre,
                })),
            ]}
          />
          {tiposEleccion.length === 0 && (
            <p className="text-sm text-red-500 mt-1">
              ⚠️ Primero debes crear un tipo de elección
            </p>
          )}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows={4}
          placeholder="Describe los detalles de esta elección..."
        />
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fechaInicio">
            Fecha de Inicio <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            id="fechaInicio"
            name="fechaInicio"
            value={formData.fechaInicio}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="fechaFin">
            Fecha de Fin <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            id="fechaFin"
            name="fechaFin"
            value={formData.fechaFin}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Estado Activo */}
      <div className="flex items-center">
        <input
          type="checkbox"
          name="activa"
          id="activa"
          checked={formData.activa}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label
          htmlFor="activa"
          className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-100"
        >
          Elección activa (los ciudadanos pueden votar)
        </label>
      </div>

      {/* Nota */}
      <Card className="bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Nota:</strong> Una elección activa estará disponible para que
          los ciudadanos voten. Solo puede haber una elección activa a la vez.
        </p>
      </Card>

      {/* Botones */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
        >
          {eleccion ? "Actualizar" : "Crear"} Elección
        </Button>
      </div>
    </form>
  );
}
