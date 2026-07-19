/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: GestionElecciones.jsx
 * UBICACIÓN: /frontend/src/pages/admin/GestionElecciones.jsx
 * ═══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getElecciones,
  createEleccion,
  updateEleccion,
  deleteEleccion,
} from "@/api/elecciones";
import Modal from "@/components/common/Modal";
import EleccionForm from "./EleccionForm";
import EleccionList from "./EleccionList";
import Loader from "@/components/common/Loader";
import Button from "@/components/common/Button";
import BackButton from "@/components/common/BackButton";
import PageHeader from "@/components/common/PageHeader";
import { Plus } from "lucide-react";
import {
  mostrarAlerta,
  confirmarEliminacion,
  manejarErrorApi,
  toastExito,
} from "@/utils/alertas";

const GestionElecciones = () => {
  const navigate = useNavigate();
  const [elecciones, setElecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [eleccionEditar, setEditar] = useState(null);

  useEffect(() => {
    loadElecciones();
  }, []);

  const loadElecciones = async () => {
    try {
      const res = await getElecciones();
      setElecciones(res.data?.data || res.data || []);
    } catch (error) {
      manejarErrorApi(error, "Error al cargar elecciones");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditar(null);
    setModalOpen(true);
  };
  const handleEdit = (e) => {
    setEditar(e);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (eleccionEditar) {
        await updateEleccion(eleccionEditar._id, formData);
        toastExito("Elección actualizada exitosamente");
      } else {
        await createEleccion(formData);
        mostrarAlerta("success", "Elección creada", "Creada exitosamente");
      }
      setModalOpen(false);
      setEditar(null);
      loadElecciones();
    } catch (error) {
      manejarErrorApi(error, "Error al guardar elección");
    }
  };

  const handleDelete = (id) => {
    const eleccion = elecciones.find((e) => e._id === id);
    confirmarEliminacion(
      "¿Eliminar elección?",
      `¿Deseas eliminar "${eleccion?.titulo}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await deleteEleccion(id);
          toastExito(`Elección "${eleccion?.titulo}" eliminada correctamente`);
          loadElecciones();
        } catch (error) {
          manejarErrorApi(error, "Error al eliminar elección");
        }
      },
    );
  };

  const handleViewStats = (id) => {
    navigate(`/admin/estadisticas/${id}`);
  };

  if (loading) return <Loader />;

  return (
    <>
      <BackButton to="/admin/elecciones" />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 mt-2">
        <PageHeader
          title="Gestión de Elecciones"
          description="Gestiona las elecciones disponibles en el sistema"
        />
        <Button
          onClick={handleCreate}
          variant="success"
          className="flex items-center gap-2 flex-shrink-0 "
        >
          <Plus className="w-5 h-5" />
          Nueva Elección
        </Button>
      </div>

      {elecciones.length > 0 ? (
        <EleccionList
          elecciones={elecciones}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewStats={handleViewStats}
        />
      ) : (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-xl mb-4">No hay elecciones registradas</p>
          <Button onClick={handleCreate} variant="outline">
            Crear la primera elección
          </Button>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditar(null);
        }}
        title={eleccionEditar ? "Editar Elección" : "Nueva Elección"}
      >
        <EleccionForm
          eleccion={eleccionEditar}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditar(null);
          }}
        />
      </Modal>
    </>
  );
};

export default GestionElecciones;
