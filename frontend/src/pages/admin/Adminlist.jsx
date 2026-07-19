import {
  Edit,
  Trash2,
  User,
  UserPlus,
  Search,
  Filter,
  Crown,
  Eye,
} from "lucide-react";
import { useState } from "react";
import Table from "@/components/common/Table";
import Button from "@/components/common/Button";
import FilterBar from "@/components/common/FilterBar";
import EmptyState from "@/components/common/EmptyState";
import Modal from "@/components/common/Modal";
import DetallesUsuarios from "./DetallesUsuarios";

export default function AdminList({ administradores, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [usuarioVer, setUsuarioVer] = useState(null);
  const [modalVerOpen, setModalVerOpen] = useState(false);

  const administradoresFiltrados = (administradores || []).filter((admin) => {
    const matchSearch =
      searchTerm === "" ||
      admin.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.cedula?.toString().includes(searchTerm) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEstado =
      filterEstado === "todos" || admin.estado === filterEstado;

    return matchSearch && matchEstado;
  });

  const handleVer = (usuario) => {
    setUsuarioVer(usuario);
    setModalVerOpen(true);
  };

  const columns = [
    {
      key: "_id",
      header: "#",
      sortable: false,
      render: (_, index) => (
        <span className="font-bold text-gray-700 dark:text-slate-300">
          {index + 1}
        </span>
      ),
      exportValue: (_, index) => index + 1,
    },
    {
      key: "cedula",
      header: "Cédula",
      sortable: true,
      render: (admin) => (
        <span className="font-mono text-sm text-gray-700 dark:text-slate-300">
          {admin.cedula || "—"}
        </span>
      ),
    },
    {
      key: "nombre",
      header: "Nombre Completo",
      sortable: true,
      render: (admin) => {
        const iniciales = admin.nombre?.charAt(0) || "?";
        return (
          <div className="flex items-center gap-3">
            {admin.fotoPerfil ? (
              <img
                src={admin.fotoPerfil}
                alt={admin.nombre}
                className="w-10 h-10 rounded-full object-cover border-2 border-green-500"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextElementSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold ${
                admin.fotoPerfil ? "hidden" : ""
              }`}
            >
              {iniciales}
            </div>
            <span className="font-medium text-gray-900 dark:text-slate-300">
              {admin.nombre}
            </span>
          </div>
        );
      },
      exportValue: (admin) => admin.nombre,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      render: (admin) => (
        <span className="text-gray-700 dark:text-slate-300">
          {admin.email || "—"}
        </span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      sortable: true,
      render: (admin) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            admin.estado === "activo"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : admin.estado === "bloqueado"
                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {admin.estado || "—"}
        </span>
      ),
      exportValue: (admin) => admin.estado,
    },
    {
      key: "acciones",
      header: "Acciones",
      sortable: false,
      className: "text-center",
      render: (admin) => (
        <div className="flex justify-center gap-1.5">
          <Button onClick={() => handleVer(admin)} variant="info" size="sm">
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(admin);
            }}
            variant="warning"
            size="sm"
            title="Editar administrador"
            // className="flex items-center justify-center !rounded-lg !py-2.5"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(admin._id);
            }}
            variant="danger"
            size="sm"
            title="Eliminar administrador"
            // className="flex items-center justify-center !rounded-lg !py-2.5"
          >
            <Trash2 className="ww-3.5 h-3.5" />
          </Button>
        </div>
      ),
      exportValue: () => "",
    },
  ];


  return (
    <>
      <div className="space-y-5">
        {administradores && administradores.length > 0 && (
          <FilterBar
            showSearch={true}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por nombre, cédula o email..."
            searchLabel="Buscar administrador"
            showFirstSelect={true}
            firstSelectValue={filterEstado}
            onFirstSelectChange={setFilterEstado}
            firstSelectOptions={[
              { value: "todos", label: "Todos los estados" },
              { value: "activo", label: "Activos" },
              { value: "bloqueado", label: "Bloqueados" },
            ]}
            firstSelectLabel="Estado"
            firstSelectIcon={<Filter className="w-5 h-5" />}
            filteredCount={administradoresFiltrados.length}
            totalCount={administradores.length}
            itemLabel="administradores"
            onClearFilters={() => {
              setSearchTerm("");
              setFilterEstado("todos");
            }}
          />
        )}

        {administradoresFiltrados.length === 0 &&
        (searchTerm !== "" || filterEstado !== "todos") ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12">
            <EmptyState
              title="No se encontraron administradores"
              description="Intenta ajustar tus filtros o realiza una nueva búsqueda"
            />
            {/* {noResultsState} */}
          </div>
        ) : (
          <Table
            data={administradoresFiltrados}
            columns={columns}
            icon={UserPlus}
            showCheckbox={true}
            showExport={true}
            exportFilename="administradores.csv"
            //   emptyState={emptyState}
            emptyState={
              <EmptyState
                title="No hay administradores registrados"
                description="No hay administradores registrados"
              />
            }
          />
        )}
      </div>
      <Modal
        isOpen={modalVerOpen}
        onClose={() => {
          setModalVerOpen(false);
          setUsuarioVer(null);
        }}
        title="Detalles del Administrador"
        bodyClassName="p-2"
      >
        <DetallesUsuarios usuario={usuarioVer} />
      </Modal>
    </>
  );
}
