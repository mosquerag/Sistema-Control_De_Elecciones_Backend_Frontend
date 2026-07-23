/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: GestionTiposEleccion.jsx
 * UBICACIÓN: /frontend/src/pages/admin/GestionTiposEleccion.jsx
 */

import { useState, useEffect } from "react";
import {
  getTiposEleccion,
  createTipoEleccion,
  deleteTipoEleccion,
  updateTipoEleccion,
} from "@/api/tiposElecciones";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";
import BackButton from "@/components/common/BackButton";
import PageHeader from "@/components/common/PageHeader";
import FilterBar from "@/components/common/FilterBar";
import StatusBadge from "@/components/common/StatusBadge";
import { Trash2, Plus, Filter, Edit, Power } from "lucide-react";
import {
  mostrarAlerta,
  confirmarAccion,
  manejarErrorApi,
} from "@/utils/alertas";

export default function GestionTiposEleccion() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tipoEditando, setTipoEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilter] = useState("todos");
  const [formData, setFormData] = useState({ nombre: "", descripcion: "" });

  useEffect(() => {
    cargarTipos();
  }, []);

  const cargarTipos = async () => {
    try {
      const res = await getTiposEleccion();
      setTipos(res.data?.data || res.data || []);
    } catch (error) {
      manejarErrorApi(error, "Error al cargar tipos de elección");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      mostrarAlerta(
        "warning",
        "Nombre requerido",
        "El campo nombre es obligatorio",
      );
      return;
    }
    try {
      if (modoEdicion) {
        await updateTipoEleccion(tipoEditando._id, formData);
        mostrarAlerta(
          "success",
          "Tipo actualizado",
          "Actualizado exitosamente",
        );
      } else {
        await createTipoEleccion(formData);
        mostrarAlerta("success", "Tipo creado", "Creado exitosamente");
      }
      setFormData({ nombre: "", descripcion: "" });
      setModalOpen(false);
      setModoEdicion(false);
      setTipoEdit(null);
      cargarTipos();
    } catch (error) {
      manejarErrorApi(error, "Error al guardar tipo de elección");
    }
  };

  const handleEdit = (tipo) => {
    setModoEdicion(true);
    setTipoEdit(tipo);
    setFormData({ nombre: tipo.nombre, descripcion: tipo.descripcion || "" });
    setModalOpen(true);
  };

  const handleNuevo = () => {
    setModoEdicion(false);
    setTipoEdit(null);
    setFormData({ nombre: "", descripcion: "" });
    setModalOpen(true);
  };

  const handleToggleActivo = (tipo) => {
    const accion = tipo.activa ? "desactivar" : "activar";
    confirmarAccion(
      `¿${tipo.activa ? "Desactivar" : "Activar"} tipo de elección?`,
      `¿Deseas ${accion} "${tipo.nombre}"?`,
      async () => {
        try {
          await updateTipoEleccion(tipo._id, { activa: !tipo.activa });
          mostrarAlerta(
            "success",
            `Tipo ${tipo.activa ? "desactivado" : "activado"}`,
            `Se ${accion === "activar" ? "activó" : "desactivó"} correctamente.`,
          );
          cargarTipos();
        } catch (error) {
          manejarErrorApi(error, `Error al ${accion} tipo de elección`);
        }
      },
    );
  };

  const handleDelete = (id) => {
    const tipo = tipos.find((t) => t._id === id);
    confirmarAccion(
      "¿Eliminar tipo de elección?",
      `¿Deseas eliminar "${tipo?.nombre}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await deleteTipoEleccion(id);
          mostrarAlerta("success", "Tipo eliminado", "Eliminado correctamente");
          cargarTipos();
        } catch (error) {
          manejarErrorApi(error, "Error al eliminar tipo de elección");
        }
      },
    );
  };

  const tiposFiltrados = tipos.filter((tipo) => {
    const matchSearch =
      searchTerm === "" ||
      tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tipo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado =
      filterEstado === "todos" ||
      (filterEstado === "activos" && tipo.activa) ||
      (filterEstado === "inactivos" && !tipo.activa);
    return matchSearch && matchEstado;
  });

  if (loading) return <Loader fullScreen />;

  return (
    <>
      <BackButton to="/admin/dashboard" />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 mt-2">
        <PageHeader
          title="Tipos de Elección"
          description="Gestiona los tipos de elecciones disponibles"
        />
        <Button
          onClick={handleNuevo}
          variant="primary"
          className="flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-5 h-5 " />
          Nuevo Tipo
        </Button>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <FilterBar
          showSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por nombre o descripción..."
          searchLabel="Buscar tipo"
          showFirstSelect
          firstSelectValue={filterEstado}
          onFirstSelectChange={setFilter}
          firstSelectOptions={[
            { value: "todos", label: "Todos los estados" },
            { value: "activos", label: "Activos" },
            { value: "inactivos", label: "Inactivos" },
          ]}
          firstSelectLabel="Estado"
          firstSelectIcon={<Filter className="w-5 h-5" />}
          filteredCount={tiposFiltrados.length}
          totalCount={tipos.length}
          itemLabel="tipos"
          onClearFilters={() => {
            setSearchTerm("");
            setFilter("todos");
          }}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tiposFiltrados.length > 0 ? (
          tiposFiltrados.map((tipo) => (
            // <div
            //   key={tipo._id}
            //   className="bg-blue-100 dark:bg-blue-800/60 rounded-2xl shadow-sm border border-blue-500 dark:border-blue-400 
            //   border-l-4 border-l-blue-500 p-5 hover:shadow-md transition-shadow"
            // >
            <div
              key={tipo._id}
              className={`rounded-2xl shadow-sm border border-l-4 p-5 hover:shadow-md transition-shadow ${
                tipo.activa
                  ? "bg-green-100 dark:bg-green-800/60 border-green-500 dark:border-green-500 border-l-green-500"
                  : "bg-gray-100 dark:bg-slate-800/60 border-gray-300 dark:border-gray-600 border-l-gray-400 opacity-70"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex-1 mr-2">
                  {tipo.nombre}
                </h3>
                {/* <div className="flex gap-1.5 flex-shrink-0">
                  <Button
                    onClick={() => handleEdit(tipo)}
                    variant="warning"
                    size="sm"
                    title="Editar"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(tipo._id)}
                    variant="danger"
                    size="sm"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div> */}

                <div className="flex gap-1.5 flex-shrink-0">
                  <Button
                    onClick={() => handleToggleActivo(tipo)}
                    variant={tipo.activa ? "secondary" : "success"}
                    size="sm"
                    title={tipo.activa ? "Desactivar" : "Activar"}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    onClick={() => handleEdit(tipo)}
                    variant="warning"
                    size="sm"
                    title="Editar"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(tipo._id)}
                    variant="danger"
                    size="sm"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {tipo.descripcion || "Sin descripción"}
              </p>

              <StatusBadge
                status={tipo.activa}
                trueLabel="Activo"
                falseLabel="Inactivo"
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400">
            <p className="text-lg font-medium">No se encontraron tipos</p>
            <p className="text-sm mt-1">
              Intenta con otros criterios de búsqueda
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modoEdicion ? "Editar Tipo de Elección" : "Crear Tipo de Elección"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Ej: Presidenciales, Municipales..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción{" "}
              <span className="text-xs text-gray-400">(opcional)</span>
            </label>
            <Textarea
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Descripción del tipo de elección..."
              rows={3}
            />
          </div>
          {/* <div className="flex gap-3 justify-end pt-4 border-t border-[var(--color-border)]"> */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {modoEdicion ? "Actualizar" : "Crear Tipo"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
