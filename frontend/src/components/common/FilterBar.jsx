import { Search, X, Filter, Calendar } from "lucide-react";
import Label from "./Label";
import Select from "./Select";
import Button from "./Button";
import React from "react";
import Input from "./Input";

const FilterBar = ({
  // Búsqueda
  showSearch = true,
  searchTerm = "",
  onSearchChange = () => {},
  searchPlaceholder = "Buscar...",
  searchLabel = "Buscar",

  // Primer Select
  showFirstSelect = false,
  firstSelectValue = "todas",
  onFirstSelectChange = () => {},
  firstSelectOptions = [],
  firstSelectLabel = "Filtrar",
  firstSelectIcon = <Filter className="w-5 h-5" />,

  // Segundo Select
  showSecondSelect = false,
  secondSelectValue = "todas",
  onSecondSelectChange = () => {},
  secondSelectOptions = [],
  secondSelectLabel = "Fecha",
  secondSelectIcon = <Calendar className="w-5 h-5" />,

  // Contador
  filteredCount = 0,
  totalCount = 0,
  itemLabel = "elementos",
  onClearFilters = () => {},
  showCounter = true,
}) => {
  const hasActiveFilters =
    searchTerm !== "" ||
    (firstSelectValue !== "todas" && firstSelectValue !== "todos") ||
    (secondSelectValue !== "todas" && secondSelectValue !== "todos");

  const visibleInputs = [
    showSearch,
    showFirstSelect, // sin verificar firstSelectOptions.length
    showSecondSelect,
  ].filter(Boolean).length;

  const gridClass =
    visibleInputs === 1
      ? "grid-cols-1"
      : visibleInputs === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="mb-6">
      <div className={`grid ${gridClass} gap-4`}>
        {showSearch && (
          <div className="flex flex-col">
            <Label>{searchLabel}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 w-5 h-5 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-blue-300 dark:border-blue-500 rounded-xl bg-white dark:bg-slate-800
                  text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500
                  focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Primer Select ──────────────────────────────────────── */}
        {showFirstSelect && firstSelectOptions.length > 0 && (
          <div className="flex flex-col">
            <Label>{firstSelectLabel}</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 pointer-events-none z-10">
                {firstSelectIcon}
              </div>
              <Select
                value={firstSelectValue}
                onChange={(e) => onFirstSelectChange(e.target.value)}
                options={firstSelectOptions}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* ── Segundo Select ─────────────────────────────────────── */}
        {showSecondSelect && secondSelectOptions.length > 0 && (
          <div>
            <Label>{secondSelectLabel}</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 pointer-events-none z-10">
                {secondSelectIcon}
              </div>
              <Select
                value={secondSelectValue}
                onChange={(e) => onSecondSelectChange(e.target.value)}
                options={secondSelectOptions}
                className="pl-10"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Contador y botón limpiar ───────────────────────────────── */}
      {showCounter && (
        <div className="flex justify-between items-center pt-2 mt-4 border-t border-gray-200 dark:border-slate-700">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Mostrando{" "}
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {filteredCount}
            </span>{" "}
            de{" "}
            <span className="font-bold text-gray-800 dark:text-white">
              {totalCount}
            </span>{" "}
            {itemLabel}
          </p>

          {hasActiveFilters && (
            <Button
              onClick={onClearFilters}
              variant="outline"
              className="text-sm font-medium transition"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
