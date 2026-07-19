/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: CandidatoList.jsx
 * UBICACIÓN: /frontend/src/pages/admin/CandidatoList.jsx
 * ═══════════════════════════════════════════════════════════════════════
 */

import { useState } from "react";
import { Edit, Trash2, UserPlus, Filter, Eye } from "lucide-react";
import Table from "@/components/common/Table";
import Button from "@/components/common/Button";
import FilterBar from "@/components/common/FilterBar";
import EmptyState from "@/components/common/EmptyState";
import Avatar from "@/components/common/Avatar";
import Modal from "@/components/common/Modal";
import DetallesUsuarios from "./DetallesUsuarios";

export default function CandidatoList({
  candidatos,
  elecciones = [],
  onEdit,
  onDelete,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPartido, setFilterPartido] = useState("todos");
  const [modalVerOpen, setModalVerOpen] = useState(false);
  const [usuarioVer, setUsuarioVer] = useState(null);

  const getNombreEleccion = (idEleccion) => {
    if (!idEleccion) return "-";
    if (
      typeof idEleccion === "object" &&
      (idEleccion.titulo || idEleccion.nombre)
    ) {
      return idEleccion.titulo || idEleccion.nombre;
    }
    const found = elecciones?.find((e) => e._id === idEleccion);
    return found
      ? found.titulo || found.nombre
      : `ID: ${String(idEleccion).slice(-6)}`;
  };

  const partidos = [
    ...new Set((candidatos || []).map((c) => c.partido).filter(Boolean)),
  ];

  const candidatosFiltrados = (candidatos || []).filter((c) => {
    const matchSearch =
      searchTerm === "" ||
      c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cedula?.toString().includes(searchTerm) ||
      c.partido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getNombreEleccion(c.idEleccion)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchPartido =
      filterPartido === "todos" || c.partido === filterPartido;
    return matchSearch && matchPartido;
  });

  const handleVer = (usuario) => {
    setUsuarioVer(usuario);
    setModalVerOpen(true); // ← esto faltaba
  };

  const columns = [
    {
      key: "_id",
      header: "#",
      render: (_, index) => (
        <span className="font-bold text-gray-500 dark:text-slate-400">
          {index + 1}
        </span>
      ),
      exportValue: (_, index) => index + 1,
    },
    {
      key: "cedula",
      header: "Cédula",
      sortable: true,
      render: (c) => <span className="font-mono text-sm">{c.cedula}</span>,
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
      key: "partido",
      header: "Partido",
      sortable: true,
      render: (c) => (
        <span className="text-gray-700 dark:text-slate-300">
          {c.partido || "-"}
        </span>
      ),
    },
    {
      key: "idEleccion",
      header: "Elección",
      sortable: false,
      render: (c) => (
        <span className="text-gray-700 dark:text-slate-300 text-sm">
          {getNombreEleccion(c.idEleccion)}
        </span>
      ),
      exportValue: (c) => getNombreEleccion(c.idEleccion),
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
            title="Editar candidato"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(c._id || c.cedula);
            }}
            variant="danger"
            size="sm"
            title="Eliminar candidato"
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
        {candidatos?.length > 0 && (
          <FilterBar
            showSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por nombre, cédula, partido o elección..."
            searchLabel="Buscar candidato"
            showFirstSelect={partidos.length > 0}
            firstSelectValue={filterPartido}
            onFirstSelectChange={setFilterPartido}
            firstSelectOptions={[
              { value: "todos", label: "Todos los partidos" },
              ...partidos.map((p) => ({ value: p, label: p })),
            ]}
            firstSelectLabel="Partido"
            firstSelectIcon={<Filter className="w-5 h-5" />}
            filteredCount={candidatosFiltrados.length}
            totalCount={candidatos.length}
            itemLabel="candidatos"
            onClearFilters={() => {
              setSearchTerm("");
              setFilterPartido("todos");
            }}
          />
        )}

        {candidatosFiltrados.length === 0 &&
        (searchTerm || filterPartido !== "todos") ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-12">
            <EmptyState
              title="No se encontraron candidatos"
              description="Intenta con otros criterios de búsqueda"
            />
          </div>
        ) : (
          <Table
            data={candidatosFiltrados}
            columns={columns}
            icon={UserPlus}
            showCheckbox
            showExport
            exportFilename="candidatos.csv"
            emptyState={
              <EmptyState
                title="No hay candidatos registrados"
                description="Haz clic en 'Nuevo Candidato' para crear uno"
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
        title="Detalles del Candidato"
        bodyClassName="p-2"
      >
        <DetallesUsuarios usuario={usuarioVer} />
      </Modal>
    </>
  );
}
