/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: CiudadanoList.jsx
 * UBICACIÓN: /frontend/src/pages/admin/CiudadanoList.jsx
 * ═══════════════════════════════════════════════════════════════════════
 */

import { useState } from "react";
import { Edit, Trash2, UserCheck, Filter, Eye } from "lucide-react";
import Table from "@/components/common/Table";
import Button from "@/components/common/Button";
import FilterBar from "@/components/common/FilterBar";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";
import Avatar from "@/components/common/Avatar";
import Modal from "@/components/common/Modal";
import DetallesUsuarios from "./DetallesUsuarios";

export default function CiudadanoList({ ciudadanos, onEdit, onDelete }) {
  const [searchTerm, setSearch] = useState("");
  const [filterEstado, setFilterEst] = useState("todos");
  const [usuarioVer, setUsuarioVer] = useState(null);
  const [modalVerOpen, setModalVerOpen] = useState(false);

  const ciudadanosFiltrados = (ciudadanos || []).filter((c) => {
    const matchSearch =
      searchTerm === "" ||
      c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cedula?.toString().includes(searchTerm) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado =
      filterEstado === "todos" ||
      (filterEstado === "activos" && c.estado === "activo") ||
      (filterEstado === "pendientes" && c.estado === "pendiente_aprobacion") ||
      (filterEstado === "bloqueados" && c.estado === "bloqueado");
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
      render: (_, index) => (
        <span className="font-bold text-gray-400 dark:text-slate-500">
          {index + 1}
        </span>
      ),
      exportValue: (_, index) => index + 1,
    },
    {
      key: "cedula",
      header: "Cédula",
      sortable: true,
      render: (c) => (
        <span className="font-mono text-sm">{c.cedula || "—"}</span>
      ),
    },
    {
      key: "nombre",
      header: "Nombre",
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-3">
          <Avatar
            nombre={c.nombre}
            foto={c.fotoPerfil}
            size="sm"
            shape="circle"
          />
          <span className="font-medium text-gray-900 dark:text-slate-200">
            {c.nombre}
          </span>
        </div>
      ),
      exportValue: (c) => c.nombre,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      render: (c) => (
        <span className="text-gray-600 dark:text-slate-400 text-sm truncate max-w-[180px] block">
          {c.email || "—"}
        </span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      sortable: true,
      render: (c) => (
        <StatusBadge
          status={c.estado === "activo"}
          trueLabel="Activo"
          falseLabel={c.estado || "Inactivo"}
        />
      ),
      exportValue: (c) => c.estado,
    },
    {
      key: "acciones",
      header: "Acciones",
      sortable: false,
      render: (c) => (
        <div className="flex justify-center gap-1.5">
          <Button onClick={() => handleVer(c)} variant="info" size="sm">
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(c);
            }}
            variant="warning"
            size="sm"
            title="Editar ciudadano"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(c._id);
            }}
            variant="danger"
            size="sm"
            title="Eliminar ciudadano"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
      exportValue: () => "",
    },
  ];

  return (
    <>
      <div className="space-y-5">
        {ciudadanos?.length > 0 && (
          <FilterBar
            showSearch
            searchTerm={searchTerm}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar por nombre, cédula o email..."
            searchLabel="Buscar ciudadano"
            showFirstSelect
            firstSelectValue={filterEstado}
            onFirstSelectChange={setFilterEst}
            firstSelectOptions={[
              { value: "todos", label: "Todos los estados" },
              { value: "activos", label: "Activos" },
              { value: "pendientes", label: "Pendientes" },
              { value: "bloqueados", label: "Bloqueados" },
            ]}
            firstSelectLabel="Estado"
            firstSelectIcon={<Filter className="w-5 h-5" />}
            filteredCount={ciudadanosFiltrados.length}
            totalCount={ciudadanos.length}
            itemLabel="ciudadanos"
            onClearFilters={() => {
              setSearch("");
              setFilterEst("todos");
            }}
          />
        )}

        <Table
          data={ciudadanosFiltrados}
          columns={columns}
          icon={UserCheck}
          showCheckbox
          showExport
          exportFilename="ciudadanos.csv"
          emptyState={
            <EmptyState
              title="No hay ciudadanos"
              description={
                searchTerm || filterEstado !== "todos"
                  ? "Intenta con otros criterios de búsqueda"
                  : "No hay ciudadanos registrados en el sistema"
              }
            />
          }
        />
      </div>
      <Modal
        isOpen={modalVerOpen}
        onClose={() => {
          setModalVerOpen(false);
          setUsuarioVer(null);
        }}
        title="Detalles del Ciudadano"
        bodyClassName="p-2"
      >
        <DetallesUsuarios usuario={usuarioVer} />
      </Modal>
    </>
  );
}
