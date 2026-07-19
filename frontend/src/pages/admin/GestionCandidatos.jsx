/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: GestionCandidatos.jsx
 * UBICACIÓN: /frontend/src/pages/admin/GestionCandidatos.jsx
 */

import { useState, useEffect } from "react";
import {
  getCandidatos,
  updateCandidato,
  deleteCandidato,
} from "@/api/candidatos";
import { registerCandidatoByAdmin } from "@/api/auth";
import Modal from "@/components/common/Modal";
import CandidatoForm from "./CandidatoForm.jsx";
import CandidatoList from "./CandidatoList.jsx";
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

const GestionCandidatos = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [candidatoEditar, setEditar] = useState(null);

  useEffect(() => {
    loadCandidatos();
  }, []);

  const loadCandidatos = async () => {
    try {
      const res = await getCandidatos();
      setCandidatos(res.data?.data || res.data || []);
    } catch (error) {
      manejarErrorApi(error, "Error al cargar candidatos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditar(null);
    setModalOpen(true);
  };
  const handleEdit = (c) => {
    setEditar(c);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (candidatoEditar) {
        await updateCandidato(candidatoEditar._id, formData);
        mostrarAlerta(
          "success",
          "Candidato actualizado",
          "Actualizado exitosamente",
        );
      } else {
        await registerCandidatoByAdmin(formData);
        mostrarAlerta(
          "success",
          "Candidato registrado",
          "Registrado exitosamente. Al iniciar sesión deberá completar su perfil.",
        );
      }
      setModalOpen(false);
      setEditar(null);
      loadCandidatos();
    } catch (error) {
      manejarErrorApi(error, "Error al guardar candidato");
    }
  };

  const handleDelete = (id) => {
    const candidato = candidatos.find((c) => c._id === id);
    confirmarEliminacion(
      "¿Eliminar candidato?",
      `¿Deseas eliminar a "${candidato?.nombre}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await deleteCandidato(id);
          toastExito(
            `Candidato "${candidato?.nombre}" eliminado correctamente`,
          );
          loadCandidatos();
        } catch (error) {
          manejarErrorApi(error, "Error al eliminar candidato");
        }
      },
    );
  };

  if (loading) return <Loader fullScreen />;

  return (
    <>
      <BackButton to="/admin/dashboard" />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 mt-2">
        <PageHeader
          title="Gestión de Candidatos"
          description="Gestiona los candidatos disponibles en el sistema"
        />
        <Button
          onClick={handleCreate}
          variant="success"
          className="flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
          Nuevo Candidato
        </Button>
      </div>

         {candidatos.length > 0 ? (
        <CandidatoList
          candidatos={candidatos}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-xl mb-4">No hay candidatos registrados</p>
          <Button onClick={handleCreate} variant="outline">
            Registrar el primer candidato
          </Button>
        </div>
      )}

      <Modal
        title={candidatoEditar ? "Editar Candidato" : "Nuevo Candidato"}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditar(null);
        }}
      >
        <CandidatoForm
          candidato={candidatoEditar}
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

export default GestionCandidatos;
