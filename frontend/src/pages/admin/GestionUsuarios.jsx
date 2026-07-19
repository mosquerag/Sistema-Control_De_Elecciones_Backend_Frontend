
import { useState, useEffect } from "react";
import { getUsuarios, updateUsuario, deleteUsuario } from "@/api/usuarios";
import Modal from "@/components/common/Modal";
import Loader from "@/components/common/Loader";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Label from "@/components/common/Label";
import Select from "@/components/common/Select";
import BackButton from "@/components/common/BackButton";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import Avatar from "@/components/common/Avatar";
import FilterBar from "@/components/common/FilterBar";
import EmptyState from "@/components/common/EmptyState";
import Table from "@/components/common/Table";
import DetallesUsuarios from "./DetallesUsuarios";
import { Trash2, Edit, Users, Filter, Eye, Plus } from "lucide-react";
import {
  mostrarAlerta,
  confirmarEliminacion,
  manejarErrorApi,
  toastExito,
} from "@/utils/alertas";
import { registerAdminByAdmin } from "@/api/auth";
import RegisterAdministrador from "../auth/RegisterAdministrador";
import { REGISTER_CONFIG } from "@/utils/registerConfig";


const ROLES_OPCIONES = [
  { value: "todos", label: "Todos los roles" },
  { value: "admin", label: "Administradores" },
  { value: "ciudadano", label: "Ciudadanos" },
  { value: "candidato", label: "Candidatos" },
];

const ESTADO_OPCIONES = [
  { value: "todos", label: "Todos los estados" },
  { value: "activo", label: "Activos" },
  { value: "pendiente_aprobacion", label: "Pendientes" },
  { value: "bloqueado", label: "Bloqueados" },
];

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalVerOpen, setModalVerOpen] = useState(false);
  const [usuarioEditar, setEditar] = useState(null);
  const [usuarioVer, setUsuarioVer] = useState(null);
  const [searchTerm, setSearch] = useState("");
  const [filterRol, setFilterRol] = useState("todos");
  const [filterEstado, setFilterEst] = useState("todos");
  const [modalCrearAdmin, setModalCrearAdmin] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    cedula: "",
    rol: "",
    estado: "",
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const res = await getUsuarios();
      setUsuarios(res.data?.data || res.data || []);
    } catch (error) {
      manejarErrorApi(error, "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  // ── Ver detalles ─────────────────────────────────────────────
  const handleVer = (usuario) => {
    setUsuarioVer(usuario);
    setModalVerOpen(true);
  };

  // ── Editar ───────────────────────────────────────────────────
  const handleEdit = (usuario) => {
    setEditar(usuario);
    setFormData({
      nombre: usuario.nombre || "",
      email: usuario.email || "",
      cedula: usuario.cedula || "",
      rol: usuario.rol || "",
      estado: usuario.estado || "",
    });
    setModalEditOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      mostrarAlerta("warning", "Nombre requerido", "El nombre es obligatorio");
      return;
    }
    try {
      await updateUsuario(usuarioEditar._id, formData);
      toastExito("Usuario actualizado correctamente");
      setModalEditOpen(false);
      setEditar(null);
      loadUsuarios();
    } catch (error) {
      manejarErrorApi(error, "Error al actualizar usuario");
    }
  };

  // ── Eliminar ─────────────────────────────────────────────────
  const handleDelete = (id) => {
    const usuario = usuarios.find((u) => u._id === id);
    confirmarEliminacion(
      "¿Eliminar usuario?",
      `¿Deseas eliminar a "${usuario?.nombre}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await deleteUsuario(id);
          toastExito(`Usuario "${usuario?.nombre}" eliminado correctamente`);
          loadUsuarios();
        } catch (error) {
          manejarErrorApi(error, "Error al eliminar usuario");
        }
      },
    );
  };

   // Usa registerAdminByAdmin — datos mínimos, contraseña = cédula
  const handleCreateAdmin = async (formData) => {
    try {
      await registerAdminByAdmin(formData);
      toastExito(
        `Administrador "${formData.nombre}" creado. Contraseña temporal: ${formData.cedula}`
      );
      setModalCrearAdmin(false);
      loadUsuarios();
    } catch (error) {
      manejarErrorApi(error, "Error al crear administrador");
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchSearch =
      searchTerm === "" ||
      u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.cedula?.toString().includes(searchTerm);
    const matchRol = filterRol === "todos" || u.rol === filterRol;
    const matchEstado = filterEstado === "todos" || u.estado === filterEstado;
    return matchSearch && matchRol && matchEstado;
  });

  const columns = [
    {
      header: "Usuario",
      key: "nombre",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar nombre={row.nombre} foto={row.fotoPerfil} size="sm" />
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
              {row.nombre}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {row.email || "Sin email"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Cédula",
      key: "cedula",
      render: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {row.cedula || "—"}
        </span>
      ),
    },
    {
      header: "Rol",
      key: "rol",
      render: (row) => <StatusBadge status={row.rol} />,
    },
    {
      header: "Estado",
      key: "estado",
      render: (row) => (
        <StatusBadge
          status={row.estado === "activo"}
          trueLabel="Activo"
          falseLabel={row.estado}
        />
      ),
    },
    {
      header: "Acciones",
      sortable: false,
      render: (row) => (
        <div className="flex gap-2">
          {/* ✅ Ver detalles */}
          <Button onClick={() => handleVer(row)} variant="info" size="sm">
            <Eye className="w-3.5 h-3.5" />
          </Button>
          {/* ✅ Editar */}
          <Button onClick={() => handleEdit(row)} variant="warning" size="sm">
            <Edit className="w-3.5 h-3.5" />
          </Button>
          {/* ✅ Eliminar */}
          <Button
            onClick={() => handleDelete(row._id)}
            variant="danger"
            size="sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <Loader fullScreen />;

  return (
    <>
      <BackButton to="/admin/dashboard" />

      <div className="mt-2 mb-6 flex justify-between items-center">
        <PageHeader
          title="Gestión de Usuarios"
          description="Administra todos los usuarios del sistema"
        />
        <Button
          onClick={() => setModalCrearAdmin(true)}
          className="px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Crear Admin
        </Button>
      </div>

      <div className="mb-6">
        <FilterBar
          showSearch
          searchTerm={searchTerm}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por nombre, email o cédula..."
          searchLabel="Buscar usuario"
          showFirstSelect
          firstSelectValue={filterRol}
          onFirstSelectChange={setFilterRol}
          firstSelectOptions={ROLES_OPCIONES}
          firstSelectLabel="Rol"
          firstSelectIcon={<Filter className="w-5 h-5" />}
          showSecondSelect
          secondSelectValue={filterEstado}
          onSecondSelectChange={setFilterEst}
          secondSelectOptions={ESTADO_OPCIONES}
          secondSelectLabel="Estado"
          filteredCount={usuariosFiltrados.length}
          totalCount={usuarios.length}
          itemLabel="usuarios"
          onClearFilters={() => {
            setSearch("");
            setFilterRol("todos");
            setFilterEst("todos");
          }}
        />
      </div>

      <Table
        data={usuariosFiltrados}
        columns={columns}
        showCheckbox={false}
        showExport
        exportFilename="usuarios.csv"
        emptyState={
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <EmptyState
              title="No se encontraron usuarios"
              description="Ajusta los filtros para ver resultados"
            />
          </div>
        }
      />

      {/* ── Modal Ver detalles  */}
      <Modal
        isOpen={modalVerOpen}
        onClose={() => {
          setModalVerOpen(false);
          setUsuarioVer(null);
        }}
        title="Detalles del Usuario"
        bodyClassName="p-2"
      >
        <DetallesUsuarios usuario={usuarioVer} />
      </Modal>

      {/* ── Modal Editar  */}
      <Modal
        isOpen={modalEditOpen}
        onClose={() => {
          setModalEditOpen(false);
          setEditar(null);
        }}
        title="Editar Usuario"
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* <div className="grid grid-cols-2 gap-4"> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre-edit">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre-edit"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="email-edit">Email</Label>
              <Input
                id="email-edit"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>
          {/* <div className="grid grid-cols-2 gap-4"> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cedula-edit">Cédula</Label>
              <Input
                id="cedula-edit"
                value={formData.cedula}
                maxLength={11}
                onChange={(e) =>
                  setFormData({ ...formData, cedula: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="estado-edit">Estado</Label>
              <Select
                id="estado-edit"
                value={formData.estado}
                onChange={(e) =>
                  setFormData({ ...formData, estado: e.target.value })
                }
                options={[
                  { value: "activo", label: "Activo" },
                  { value: "pendiente_aprobacion", label: "Pendiente" },
                  { value: "bloqueado", label: "Bloqueado" },
                ]}
              />
            </div>
          </div>

          {/* <div className="flex gap-3 justify-end pt-4 border-t border-[var(--color-border)]"> */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">

            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalEditOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal Crear Admin  */}
      {/* Modal crear admin — campos mínimos desde registerConfig */}
      <Modal
        isOpen={modalCrearAdmin}
        onClose={() => setModalCrearAdmin(false)}
        title="Crear Administrador"
      >
        <RegisterAdministrador
          userType={REGISTER_CONFIG.ADMIN_BY_ADMIN}
          registerFunction={handleCreateAdmin}
          showBackButton={false}
          isModal={true}
          onSuccess={() => { setModalCrearAdmin(false); loadUsuarios(); }}
          onCancel={() => setModalCrearAdmin(false)}
        />
      </Modal>
    </>
  );
}
