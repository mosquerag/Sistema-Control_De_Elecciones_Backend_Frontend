/**
 * Table - Componente de tabla genérico y reutilizable
 *
 * @param {Array} data - Datos a mostrar en la tabla
 * @param {Array} columns - Configuración de las columnas
 * @param {String} title - Título de la tabla
 * @param {Component} icon - Icono del título (opcional)
 * @param {Boolean} showCheckbox - Mostrar checkboxes de selección
 * @param {Boolean} showExport - Mostrar botón de exportar
 * @param {String} exportFilename - Nombre del archivo CSV
 * @param {Function} onRowClick - Callback cuando se hace click en una fila
 * @param {Component} emptyState - Componente a mostrar cuando no hay datos
 **/

import { useState, useEffect } from "react";

export default function Table({
  data = [],
  columns = [],
  title = "Tabla",
  icon: Icon = null,
  showCheckbox = true,
  showExport = true,
  exportFilename = "export.csv",
  onRowClick = null,
  emptyState = null,
  defaultRowsPerPage = 10,
}) {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortedData, setSortedData] = useState(data);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  useEffect(() => {
    setSortedData(data);
    setSelectedRows([]);
    setSelectAll(false);
    // Solo vuelve a página 1 si la cantidad de datos cambió (ej: eliminación)
    if (data.length !== sortedData.length) {
      setCurrentPage(1);
    }
  }, [data]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(
        paginatedData.map((_, i) => (currentPage - 1) * rowsPerPage + i),
      );
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((i) => i !== index));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedRows, index];
      setSelectedRows(newSelected);
      if (newSelected.length === sortedData.length) setSelectAll(true);
    }
  };

  const handleSort = (columnKey, customSort) => {
    const direction =
      sortColumn === columnKey && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(columnKey);
    setSortDirection(direction);
    setCurrentPage(1);
    const sorted = [...sortedData].sort((a, b) => {
      if (customSort) return customSort(a, b, direction);
      let valA = (a[columnKey] || "").toString().toLowerCase();
      let valB = (b[columnKey] || "").toString().toLowerCase();
      return direction === "asc"
        ? valA > valB
          ? 1
          : -1
        : valA < valB
          ? 1
          : -1;
    });
    setSortedData(sorted);
  };

  const exportCSV = () => {
    const headers = columns.map((col) => col.header);
    const rows =
      selectedRows.length > 0
        ? selectedRows.map((i) => sortedData[i])
        : sortedData;
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        columns
          .map((col) => {
            let value = col.exportValue
              ? col.exportValue(row)
              : row[col.key] || "";
            value = value.toString().replace(/"/g, '""');
            return `"${value}"`;
          })
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Empty state ────────────────────────────────────────────────
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12">
        {emptyState || (
          <div className="text-center">
            <p className="text-gray-500 dark:text-slate-400 text-lg font-semibold">
              No hay datos para mostrar
            </p>
          </div>
        )}
      </div>
    );
  }

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push("...");
    }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) {
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className="p-1 w-full bg-white dark:bg-slate-800
                    divide-y divide-gray-200 dark:divide-slate-500
                    rounded-2xl shadow-lg"
    >
      {/* ── Botón exportar ──────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-1">
        {showExport && (
          <button
            onClick={exportCSV}
            disabled={sortedData.length === 0}
            className="flex items-center gap-2
                       text-gray-700 dark:text-slate-200
                       hover:text-blue-600 dark:hover:text-blue-400
                       transition-colors duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M11.5 21h-4.5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v5m-5 6h7m-3 -3l3 3l-3 3" />
            </svg>
            Exportar
          </button>
        )}
      </div>

      {/* ── Tabla ───────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            className="bg-white dark:bg-slate-800
                            divide-y divide-gray-200 dark:divide-slate-400
                            border-b border-gray-300 dark:border-slate-500"
          >
            <tr>
              {showCheckbox && (
                <th className="rounded-l-lg p-1">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  onClick={() =>
                    column.sortable !== false &&
                    handleSort(column.key, column.customSort)
                  }
                  className={`p-1 text-left font-bold transition-colors whitespace-nowrap
                    text-gray-700 dark:text-slate-300
                    ${
                      column.sortable !== false
                        ? "cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 select-none"
                        : ""
                    }
                    ${!showCheckbox && index === 0 ? "rounded-l-lg" : ""}
                    ${index === columns.length - 1 ? "rounded-r-lg" : ""}
                  `}
                >
                  {column.header}
                  {column.sortable !== false && sortColumn === column.key && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody
            className="bg-white dark:bg-slate-800
                            divide-y divide-gray-200 dark:divide-slate-500"
          >
            {paginatedData.map((row, rowIndex) => {
              const absoluteIndex = (currentPage - 1) * rowsPerPage + rowIndex;
              return (
                <tr
                  key={row._id || row.id || absoluteIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className="border-b border-gray-100 dark:border-slate-700
                             hover:text-blue-600 dark:hover:text-blue-400
                             transition-colors cursor-pointer group"
                >
                  {showCheckbox && (
                    <td className="p-1">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(absoluteIndex)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowSelect(absoluteIndex);
                        }}
                        className="w-5 h-5 accent-blue-600 cursor-pointe"
                      />
                    </td>
                  )}
                  {columns.map((column, colIndex) => (
                    <td
                      key={`${absoluteIndex}-${column.key || colIndex}`}
                      className={`p-1 ${column.className || ""}`}
                    >
                      {column.render
                        ? column.render(row, absoluteIndex)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Footer paginación ───────────────────────────────────── */}
      <footer className="mt-2 flex flex-wrap items-center justify-between gap-2 pt-2 px-1">
        {/* Filas por página */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-100">
          <span>Mostrar</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 dark:border-gray-600
                       rounded-lg px-2 py-1 text-sm
                       text-gray-700 dark:text-slate-200
                       bg-white dark:bg-slate-700
                       focus:outline-none focus:ring-2 focus:ring-blue-400
                       cursor-pointer"
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>por página</span>
        </div>

        {/* Info resultados */}
        <span className="text-sm text-gray-500 dark:text-gray-100">
          {(currentPage - 1) * rowsPerPage + 1}–
          {Math.min(currentPage * rowsPerPage, sortedData.length)} de{" "}
          {sortedData.length} resultado{sortedData.length !== 1 ? "s" : ""}
        </span>

        {/* Botones página */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-lg
                       text-gray-600 dark:text-gray-100
                       hover:bg-blue-50 dark:hover:bg-slate-700
                       hover:text-blue-600 dark:hover:text-blue-400
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Página anterior"
          >
            ‹
          </button>

          {getPageNumbers().map((page, i) =>
            page === "..." ? (
              <span
                key={`dots-${i}`}
                className="px-2 text-gray-400 dark:text-slate-500 select-none"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                  ${
                    currentPage === page
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
              >
                {page}
              </button>
            ),
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-lg
                       text-gray-600 dark:text-slate-300
                       hover:bg-blue-50 dark:hover:bg-slate-700
                       hover:text-blue-600 dark:hover:text-blue-400
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Página siguiente"
          >
            ›
          </button>
        </div>
      </footer>
    </div>
  );
}
