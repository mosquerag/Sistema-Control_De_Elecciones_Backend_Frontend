/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: EleccionList.jsx
 * UBICACIÓN: /frontend/src/pages/admin/EleccionList.jsx
 */

import { useState } from "react";
import { Edit, Trash2, BarChart3 } from "lucide-react";
import Button from "@/components/common/Button";
import FilterBar from "@/components/common/FilterBar";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import { formatDate } from "@/utils/formatDate";

export default function EleccionList({
  elecciones,
  onEdit,
  onDelete,
  onViewStats,
}) {
  const [searchTerm, setSearch] = useState("");
  const [filterEstado, setFilter] = useState("todas");

  const getTipoNombre = (e) =>
    e.idTipoEleccion?.nombre || e.tipoEleccion?.nombre || e.tipo || "—";

  // const estaActiva = (e) => {
  //   const hoy = new Date();
  //   return e.activa && new Date(e.fechaFin) >= hoy;
  // };

  // const getBgByEstado = (activa) => {
  //   if (activa) return "!bg-green-100 dark:!bg-green-900/60";
  //   return "!bg-red-50 dark:!bg-red-950/40";
  // };

  const getEstado = (e) => {
    const hoy = new Date();
    const finalizada = new Date(e.fechaFin) < hoy;
    if (finalizada) return "finalizada";
    return e.activa ? "activa" : "inactiva";
  };

  const getBgByEstado = (estado) => {
    if (estado === "activa") return "!bg-green-100 dark:!bg-green-900/60";
    if (estado === "inactiva") return "!bg-gray-100 dark:!bg-slate-800/60";
    return "!bg-red-50 dark:!bg-red-950/40";
  };

  const getBorderByEstado = (estado) => {
    if (estado === "activa") return "border-green-400 dark:border-green-600";
    if (estado === "inactiva") return "border-gray-300 dark:border-gray-600";
    return "border-red-400 dark:border-red-600";
  };

  const filtradas = elecciones.filter((e) => {
    const matchSearch =
      searchTerm === "" ||
      e.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTipoNombre(e).toLowerCase().includes(searchTerm.toLowerCase());
    // const activa = estaActiva(e);
    // const matchEstado =
    //   filterEstado === "todas" ||
    //   (filterEstado === "activas" && activa) ||
    //   (filterEstado === "finalizadas" && !activa);

    const estado = getEstado(e);
    const matchEstado =
      filterEstado === "todas" ||
      (filterEstado === "activas" && estado === "activa") ||
      (filterEstado === "inactivas" && estado === "inactiva") ||
      (filterEstado === "finalizadas" && estado === "finalizada");
    return matchSearch && matchEstado;
  });

  return (
    <div className="space-y-5">
      <FilterBar
        showSearch
        searchTerm={searchTerm}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por título o tipo..."
        searchLabel="Buscar elección"
        showFirstSelect
        firstSelectValue={filterEstado}
        onFirstSelectChange={setFilter}
        // firstSelectOptions={[
        //   { value: "todas", label: "Todas" },
        //   { value: "activas", label: "Activas" },
        //   { value: "finalizadas", label: "Finalizadas" },
        // ]}
        firstSelectOptions={[
          { value: "todas", label: "Todas" },
          { value: "activas", label: "Activas" },
          { value: "inactivas", label: "Inactivas" },
          { value: "finalizadas", label: "Finalizadas" },
        ]}
        firstSelectLabel="Estado"
        filteredCount={filtradas.length}
        totalCount={elecciones.length}
        itemLabel="elecciones"
        onClearFilters={() => {
          setSearch("");
          setFilter("todas");
        }}
      />

      {filtradas.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="Intenta con otros criterios de búsqueda"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* {filtradas.map((eleccion) => {
            const activa = estaActiva(eleccion);
            return (
              
              <div
                key={eleccion._id}
                className={`${getBgByEstado(activa)} rounded-2xl border-2 p-5 shadow-sm
                  hover:shadow-md transition-shadow
                  ${
                    activa
                      ? "border-green-400 dark:border-green-600"
                      : "border-red-400 dark:border-red-600"
                  }`}
              >
                
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 flex-1 leading-tight">
                    {eleccion.titulo}
                  </h3>
                  <StatusBadge
             
                    status={activa ? "activa" : "finalizada"}
                    trueLabel="Activa"
                    falseLabel="Finalizada"
                  />
                </div> */}

          {filtradas.map((eleccion) => {
            const estado = getEstado(eleccion);
            return (
              <div
                key={eleccion._id}
                className={`${getBgByEstado(estado)} rounded-2xl border-2 p-5 shadow-sm
                  hover:shadow-md transition-shadow
                  ${getBorderByEstado(estado)}`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 flex-1 leading-tight">
                    {eleccion.titulo}
                  </h3>
                  <StatusBadge status={estado} />
                </div>

                {/* Info */}
                <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <p>
                    <span className="font-medium">Tipo:</span>{" "}
                    {getTipoNombre(eleccion)}
                  </p>
                  <p>
                    <span className="font-medium">Inicio:</span>{" "}
                    {formatDate(eleccion.fechaInicio)}
                  </p>
                  <p>
                    <span className="font-medium">Fin:</span>{" "}
                    {formatDate(eleccion.fechaFin)}
                  </p>
                  <p>
                    <span className="font-medium">Votantes:</span>{" "}
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {eleccion.totalVotantes ?? 0}
                    </span>
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => onEdit(eleccion)}
                    variant="warning"
                    size="sm"
                    className="flex-1 gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Editar
                  </Button>
                  <Button
                    onClick={() => onViewStats?.(eleccion._id)}
                    variant="info"
                    size="sm"
                    className="flex-1 gap-1"
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> Stats
                  </Button>
                  <Button
                    onClick={() => onDelete(eleccion._id)}
                    variant="danger"
                    size="sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
