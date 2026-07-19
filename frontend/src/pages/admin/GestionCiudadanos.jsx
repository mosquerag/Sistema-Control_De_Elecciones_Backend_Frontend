/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: GestionCiudadanos.jsx
 * UBICACIÓN: /frontend/src/pages/admin/GestionCiudadanos.jsx
 */

import { useState, useEffect } from "react";
import { getCiudadanos } from "@/api/ciudadanos";
import { updateUsuario, deleteUsuario } from "@/api/usuarios";
import Modal from "@/components/common/Modal";
import CiudadanoForm from "./CiudadanoForm";
import CiudadanoList from "./CiudadanoList";
import Loader from "@/components/common/Loader";
import Button from "@/components/common/Button";
import BackButton from "@/components/common/BackButton";
import PageHeader from "@/components/common/PageHeader";
import { Users, Plus } from "lucide-react";
import {
  confirmarEliminacion,
  manejarErrorApi,
  toastExito,
  mostrarAlerta,
} from "@/utils/alertas";
import { registerCiudadanoByAdmin } from '@/api/auth';

export default function GestionCiudadanos() {
  const [ciudadanos, setCiudadanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [ciudadanoEditar, setEditar] = useState(null);

  useEffect(() => {
    loadCiudadanos();
  }, []);

  const loadCiudadanos = async () => {
    try {
      const res = await getCiudadanos();
      // ✅ Extracción correcta
      setCiudadanos(res.data?.data || res.data || []);
    } catch (error) {
      manejarErrorApi(error, "Error al cargar ciudadanos");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ciudadano) => {
    setEditar(ciudadano);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      // updateCiudadano apunta a /usuarios/:id (corrección aplicada en v2)
      // await updateUsuario(ciudadanoEditar._id, formData);
      // DESPUÉS
      if (ciudadanoEditar) {
        await updateUsuario(ciudadanoEditar._id, formData);
      } else {
        await registerCiudadanoByAdmin(formData);
      }
      mostrarAlerta(
        "success",
        "Ciudadano actualizado",
        "Actualizado exitosamente",
      );
      setModalOpen(false);
      setEditar(null);
      loadCiudadanos();
    } catch (error) {
      manejarErrorApi(error, "Error al actualizar ciudadano");
    }
  };

  const handleDelete = (id) => {
    const ciudadano = ciudadanos.find((c) => c._id === id);
    confirmarEliminacion(
      "¿Eliminar ciudadano?",
      `¿Deseas eliminar a "${ciudadano?.nombre}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await deleteUsuario(id);
          toastExito(
            `Ciudadano "${ciudadano?.nombre}" eliminado correctamente`,
          );
          loadCiudadanos();
        } catch (error) {
          manejarErrorApi(error, "Error al eliminar ciudadano");
        }
      },
    );
  };

  if (loading) return <Loader fullScreen />;

  return (
    <>
      <BackButton to="/admin/dashboard" />
      {/* <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 mt-2">
        <PageHeader
          title="Gestión de Ciudadanos"
          description={`${ciudadanos.length} ciudadano${ciudadanos.length !== 1 ? "s" : ""} registrado${ciudadanos.length !== 1 ? "s" : ""}`}
        />
      </div> */}
     
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 mt-2">
        <PageHeader
          title="Gestión de Ciudadanos"
          description={`${ciudadanos.length} ciudadano${ciudadanos.length !== 1 ? "s" : ""} registrado${ciudadanos.length !== 1 ? "s" : ""}`}
        />
        <Button
          onClick={() => {
            setEditar(null);
            setModalOpen(true);
          }}
          variant="success"
          className="flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
          Nuevo Ciudadano
        </Button>
      </div>
      {ciudadanos.length > 0 ? (
        <CiudadanoList
          ciudadanos={ciudadanos}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-xl mb-2">No hay ciudadanos registrados</p>
          <p className="text-sm">
            Los ciudadanos aparecerán aquí una vez se registren
          </p>
        </div>
      )}
      <Modal
        title="Editar Ciudadano"
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditar(null);
        }}
      >
        <CiudadanoForm
          ciudadano={ciudadanoEditar}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditar(null);
          }}
        />
      </Modal>
    </>
  );
}
