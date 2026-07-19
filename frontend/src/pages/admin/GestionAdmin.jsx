import { useEffect, useState } from "react";
import { getUsuariosByRol } from "@/api/usuarios";
import { updateUsuario, deleteUsuario } from "@/api/usuarios";
import { registerAdminByAdmin } from "@/api/auth";
import Loader from "@/components/common/Loader";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import AdminList from "./AdminList.jsx";
import RegisterAdministrador from "../auth/RegisterAdministrador";
import { REGISTER_CONFIG } from "@/utils/registerConfig";
import { mostrarAlerta, confirmarEliminacion, manejarErrorApi, toastExito } from "@/utils/alertas";
import { Plus } from "lucide-react";

const GestionAdmin = () => {
  const [administradores, setAdministradores] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [modalOpen, setModalOpen]           = useState(false);
  const [adminEditar, setAdminEditar]       = useState(null);

  useEffect(() => {
    loadAdministradores();
  }, []);

  const loadAdministradores = async () => {
    try {
      const res = await getUsuariosByRol("admin");
      setAdministradores(res.data?.data || res.data || []);
    } catch (error) {
      manejarErrorApi(error, "Error al cargar administradores");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setAdminEditar(null);
    setModalOpen(true);
  };

  const handleEdit = (admin) => {
    setAdminEditar(admin);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setAdminEditar(null);
    loadAdministradores();
  };

  const handleDelete = (id) => {
    const admin = administradores.find((a) => a._id === id);
    confirmarEliminacion(
      "¿Eliminar administrador?",
      `¿Deseas eliminar a "${admin?.nombre}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await deleteUsuario(id);
          toastExito(`Administrador "${admin?.nombre}" eliminado correctamente`);
          loadAdministradores();
        } catch (error) {
          manejarErrorApi(error, "Error al eliminar administrador");
        }
      },
    );
  };

  const handleSubmit = async (formData) => {
    try {
      if (adminEditar) {
        await updateUsuario(adminEditar._id, formData);
        mostrarAlerta("success", "Administrador actualizado", "Actualizado exitosamente");
      } else {
        await registerAdminByAdmin(formData);
        mostrarAlerta("success", "Administrador creado", "Creado exitosamente. Contraseña temporal: su cédula.");
      }
      handleSuccess();
    } catch (error) {
      manejarErrorApi(error, "Error al guardar administrador");
    }
  };

  return (
    <>
      <BackButton to="/admin/dashboard" />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 mt-2">
        <PageHeader
          title="Gestión de Administradores"
          description={`${administradores.length} administrador${administradores.length !== 1 ? "es" : ""} registrado${administradores.length !== 1 ? "s" : ""}`}
        />
        <Button
          onClick={handleCreate}
          variant="primary"
          className="flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
          Nuevo Administrador
        </Button>
      </div>

      {loading ? (
        <Loader fullScreen />
      ) : (
        <AdminList
          administradores={administradores}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setAdminEditar(null); }}
        title={adminEditar ? "Editar Administrador" : "Nuevo Administrador"}
      >
        <RegisterAdministrador
          userType={REGISTER_CONFIG.ADMIN_BY_ADMIN}
          registerFunction={handleSubmit}
          usuarioEditar={adminEditar}
          isModal={true}
          onSuccess={handleSuccess}
          onCancel={() => { setModalOpen(false); setAdminEditar(null); }}
        />
      </Modal>
    </>
  );
};

export default GestionAdmin;