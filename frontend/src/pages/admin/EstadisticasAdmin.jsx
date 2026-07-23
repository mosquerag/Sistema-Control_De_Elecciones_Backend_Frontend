import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getResultadosEleccion } from "@/api/estadisticas";
import { getElecciones } from "@/api/elecciones";
import Loader from "@/components/common/Loader";
import { Trophy, TrendingUp, Vote } from "lucide-react";
import Card from "@/components/common/Card";
import { Users } from "lucide-react";
import Button from "@/components/common/Button";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import BackButton from "@/components/common/BackButton";
import StatusBadge from "@/components/common/StatusBadge";
import FilterBar from "@/components/common/FilterBar";
import { manejarErrorApi } from "@/utils/alertas";
import Avatar from "@/components/common/Avatar";

const COLORES = ["#1D9E75", "#378ADD", "#BA7517", "#B4B2A9"];
const PCT_COLORS = [
  "text-teal-700 dark:text-teal-400",
  "text-blue-600 dark:text-blue-400",
  "text-amber-600 dark:text-amber-400",
  "text-slate-400",
];

const DonutChart = ({ resultados }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !resultados?.length) return;
    const build = () => {
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = new window.Chart(canvasRef.current, {
        type: "doughnut",
        data: {
          datasets: [
            {
              data: resultados.map((r) => r.porcentaje),
              backgroundColor: resultados.map(
                (_, i) => COLORES[Math.min(i, COLORES.length - 1)],
              ),
              borderWidth: 0,
              hoverOffset: 3,
            },
          ],
        },
        options: {
          responsive: false,
          cutout: "72%",
          plugins: { legend: { display: false }, tooltip: { enabled: true } },
        },
      });
    };
    if (!window.Chart) {
      const s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
      s.onload = build;
      document.head.appendChild(s);
    } else {
      build();
    }
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [resultados]);

  return (
    <canvas
      ref={canvasRef}
      width={100}
      height={100}
      role="img"
      aria-label="Distribución de votos entre candidatos"
    />
  );
};

const EstadisticasAdmin = () => {
  const navigate = useNavigate();
  const { idEleccion } = useParams();

  const [elecciones, setElecciones] = useState([]);
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterFecha, setFilterFecha] = useState("todas");

  useEffect(() => {
    loadElecciones();
  }, []);
  useEffect(() => {
    if (idEleccion) loadResultados(idEleccion);
  }, [idEleccion]);

  const loadElecciones = async () => {
    try {
      setLoading(true);
      const res = await getElecciones();
      setElecciones(res.data?.data || res.data || []);
    } catch (error) {
      manejarErrorApi(error, "Error al cargar elecciones");
    } finally {
      setLoading(false);
    }
  };

  const loadResultados = async (id) => {
    try {
      setLoading(true);
      const res = await getResultadosEleccion(id);
      setResultados(res.data?.data || res.data);
    } catch (error) {
      manejarErrorApi(error, "Error al cargar resultados");
      setResultados(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const getEstadoEleccion = (eleccion) => {
    const ahora = new Date();
    const fin = new Date(eleccion.fechaFin);
    const inicio = new Date(eleccion.fechaInicio);
    if (!eleccion.activa) return "inactiva";
    if (ahora > fin) return "finalizada";
    if (ahora < inicio) return "proxima";
    return "activa";
  };

  const getBorderByEstado = (eleccion) => {
    const estado = getEstadoEleccion(eleccion);
    if (estado === "activa")
      return "!border-2 !border-green-400 dark:!border-green-600";
    if (estado === "finalizada")
      return "!border-2 !border-red-400 dark:!border-red-600";
    if (estado === "proxima")
      return "!border-2 !border-blue-400 dark:!border-blue-500";
    return "!border-2 !border-gray-300 dark:!border-gray-600";
  };

  const getBgByEstado = (eleccion) => {
    const estado = getEstadoEleccion(eleccion);
    if (estado === "activa") return "!bg-green-100 dark:!bg-green-900/60";
    if (estado === "finalizada") return "!bg-red-100 dark:!bg-red-900/60";
    if (estado === "proxima") return "!bg-blue-100 dark:!bg-blue-900/60";
    return "!bg-gray-50 dark:!bg-slate-800/60";
  };

  const getButtonByEstado = (eleccion) => {
    const estado = getEstadoEleccion(eleccion);
    if (estado === "activa")
      return "!bg-green-600 hover:!bg-green-700 dark:!bg-green-800 dark:hover:!bg-green-700";
    if (estado === "finalizada")
      return "!bg-red-600 hover:!bg-red-700 dark:!bg-red-800 dark:hover:!bg-red-700";
    if (estado === "proxima")
      return "!bg-blue-600 hover:!bg-blue-700 dark:!bg-blue-800 dark:hover:!bg-blue-700";
    return "!bg-gray-500 hover:!bg-gray-600 dark:!bg-gray-600 dark:hover:!bg-gray-700";
  };

  const filtrarPorFecha = (eleccion) => {
    if (filterFecha === "todas") return true;
    const ahora = new Date();
    const hoyUTC = `${ahora.getUTCFullYear()}-${String(ahora.getUTCMonth() + 1).padStart(2, "0")}-${String(ahora.getUTCDate()).padStart(2, "0")}`;
    const fi = new Date(eleccion.fechaInicio);
    const fechaInicioUTC = `${fi.getUTCFullYear()}-${String(fi.getUTCMonth() + 1).padStart(2, "0")}-${String(fi.getUTCDate()).padStart(2, "0")}`;
    if (filterFecha === "hoy") return fechaInicioUTC === hoyUTC;
    const hoyDate = new Date(`${hoyUTC}T00:00:00.000Z`);
    const inicioDate = new Date(`${fechaInicioUTC}T00:00:00.000Z`);
    if (filterFecha === "semana") {
      const limite = new Date(hoyDate);
      limite.setUTCDate(limite.getUTCDate() + 7);
      return inicioDate >= hoyDate && inicioDate <= limite;
    }
    if (filterFecha === "mes") {
      const limite = new Date(hoyDate);
      limite.setUTCMonth(limite.getUTCMonth() + 1);
      return inicioDate >= hoyDate && inicioDate <= limite;
    }
    return true;
  };

  const eleccionesFiltradas = elecciones.filter((eleccion) => {
    const matchSearch =
      searchTerm === "" ||
      eleccion.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eleccion.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado =
      filterEstado === "todos" || getEstadoEleccion(eleccion) === filterEstado;
    return matchSearch && matchEstado && filtrarPorFecha(eleccion);
  });

  if (loading) return <Loader />;

  return (
    <>
      <BackButton to="/admin/estadisticas" />
      <PageHeader
        title="Estadísticas y Resultados"
        description="Visualiza las estadísticas y resultados de las elecciones"
      />

      {/* ── Lista de elecciones ── */}
      {!idEleccion && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Selecciona una elección para ver estadísticas
          </h2>

          <FilterBar
            showSearch={true}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por nombre o descripción..."
            searchLabel="Buscar"
            showFirstSelect={true}
            firstSelectValue={filterEstado}
            onFirstSelectChange={setFilterEstado}
            firstSelectOptions={[
              { value: "todos", label: "Todos los estados" },
              { value: "activa", label: "Activas" },
              { value: "proxima", label: "Próximas" },
              { value: "finalizada", label: "Finalizadas" },
              { value: "inactiva", label: "Inactivas" },
            ]}
            firstSelectLabel="Estado"
            showSecondSelect={true}
            secondSelectValue={filterFecha}
            onSecondSelectChange={setFilterFecha}
            secondSelectOptions={[
              { value: "todas", label: "Todas las fechas" },
              { value: "hoy", label: "Hoy" },
              { value: "semana", label: "Próximos 7 días" },
              { value: "mes", label: "Próximo mes" },
            ]}
            secondSelectLabel="Fecha"
            filteredCount={eleccionesFiltradas.length}
            totalCount={elecciones.length}
            itemLabel="elecciones"
            onClearFilters={() => {
              setSearchTerm("");
              setFilterEstado("todos");
              setFilterFecha("todas");
            }}
          />

          {elecciones.length === 0 ? (
            <Card className="p-8 text-center">
              <Vote className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <EmptyState
                title="No hay elecciones registradas"
                description="Las elecciones que crees aparecerán aquí"
              />
              <Button
                onClick={() => navigate("/admin/elecciones")}
                className="mt-4"
              >
                Ir a Gestión de Elecciones
              </Button>
            </Card>
          ) : eleccionesFiltradas.length === 0 ? (
            <Card className="p-8 text-center">
              <EmptyState
                title="No se encontraron elecciones"
                description="Intenta ajustar tus filtros o realiza una nueva búsqueda"
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eleccionesFiltradas.map((eleccion) => (
                // <Card
                //   key={eleccion._id}
                //   className={`p-6 hover:shadow-xl transition-all  ${getBorderByEstado(eleccion)}`}
                // >
                <Card
                  key={eleccion._id}
                  className={`p-6 hover:shadow-xl transition-all ${getBgByEstado(eleccion)} ${getBorderByEstado(eleccion)}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">
                        {eleccion.titulo}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-100/90 line-clamp-2">
                        {eleccion.descripcion}
                      </p>
                    </div>
                    <StatusBadge status={getEstadoEleccion(eleccion)} />
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                    <p>Inicio: {formatDate(eleccion.fechaInicio)}</p>
                    <p>Fin: {formatDate(eleccion.fechaFin)}</p>
                  </div>
                  {/* <Button
                    variant="primary"
                    className="w-full "
                    onClick={() =>
                      navigate(`/admin/estadisticas/${eleccion._id}`)
                    }
                  >
                    Ver Estadísticas
                  </Button> */}

                  <Button
                    variant="primary"
                    className={`w-full ${getButtonByEstado(eleccion)}`}
                    onClick={() =>
                      navigate(`/admin/estadisticas/${eleccion._id}`)
                    }
                  >
                    Ver Estadísticas
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {idEleccion && resultados && (
        <div className="space-y-3">
          <div className="bg-blue-400/20 dark:bg-blue-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-700">
              {/* <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700"> */}
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {resultados.eleccion?.titulo}
              </h2>
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-100 px-3 py-1.5 rounded-lg w-fit">
                <Users className="w-4 h-4" />
                <div>
                  <p className="text-xs font-medium">Total Votantes</p>
                  <p className="text-blue-800 dark:text-blue-100 font-bold leading-tight">
                    {resultados.eleccion?.totalVotantes}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Podio top 3 ── */}
            {resultados.resultados?.length > 0 && (
              <div className="flex items-end justify-center gap-3 px-3 pt-2">
                {/* <div className="flex items-end justify-center gap-3 px-6 pt-4"> */}
                {/* 2do lugar */}
                {resultados.resultados[1] && (
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <Avatar
                      nombre={resultados.resultados[1].candidato?.nombre}
                      foto={resultados.resultados[1].candidato?.fotoPerfil}
                      size="sm"
                      shape="circle"
                      gradient="from-blue-400 to-blue-600"
                    />
                    <p className="text-xs font-semibold text-center text-slate-700 dark:text-slate-200 leading-tight truncate w-full">
                      {resultados.resultados[1].candidato?.nombre
                        ?.split(" ")
                        .slice(0, 2)
                        .join(" ")}
                    </p>
                    <p className="text-xs font-bold text-blue-500">
                      {resultados.resultados[1].porcentaje}%
                    </p>
                    <div className="w-full h-14 bg-blue-500 rounded-t-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2°</span>
                    </div>
                  </div>
                )}

                {/* 1er lugar */}
                {resultados.resultados[0] && (
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <Avatar
                      nombre={resultados.resultados[0].candidato?.nombre}
                      foto={resultados.resultados[0].candidato?.fotoPerfil}
                      size="sm"
                      shape="circle"
                      gradient="from-green-400 to-green-600"
                    />
                    <p className="text-xs font-semibold text-center text-slate-700 dark:text-slate-200 leading-tight truncate w-full">
                      {resultados.resultados[0].candidato?.nombre
                        ?.split(" ")
                        .slice(0, 2)
                        .join(" ")}
                    </p>
                    <p className="text-xs font-bold text-green-500">
                      {resultados.resultados[0].porcentaje}%
                    </p>
                    <div className="w-full h-20 bg-green-500 rounded-t-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1°</span>
                    </div>
                  </div>
                )}

                {/* 3er lugar */}
                {resultados.resultados[2] && (
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <Avatar
                      nombre={resultados.resultados[2].candidato?.nombre}
                      foto={resultados.resultados[2].candidato?.fotoPerfil}
                      size="sm"
                      shape="circle"
                      gradient="from-amber-400 to-amber-600"
                    />
                    <p className="text-xs font-semibold text-center text-slate-700 dark:text-slate-200 leading-tight truncate w-full">
                      {resultados.resultados[2].candidato?.nombre
                        ?.split(" ")
                        .slice(0, 2)
                        .join(" ")}
                    </p>
                    <p className="text-xs font-bold text-amber-500">
                      {resultados.resultados[2].porcentaje}%
                    </p>
                    <div className="w-full h-10 bg-amber-500 rounded-t-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">3°</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Tabla compacta ── */}
            <div className="px-3 py-1.5">
              {/* <div className="px-6 py-3"> */}
              <div className="overflow-x-auto rounded-xl">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden min-w-[500px]">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left font-semibold text-slate-400 dark:text-slate-500 px-3 py-2 whitespace-nowrap">
                          #
                        </th>
                        <th className="text-left font-semibold text-slate-400 dark:text-slate-500 px-3 py-2 whitespace-nowrap">
                          Candidato
                        </th>
                        <th className="text-right font-semibold text-slate-400 dark:text-slate-500 px-3 py-2 whitespace-nowrap">
                          Votos
                        </th>
                        <th className="text-right font-semibold text-slate-400 dark:text-slate-500 px-3 py-2 whitespace-nowrap">
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultados.resultados?.map((resultado, index) => {
                        const colors = [
                          "text-green-500",
                          "text-blue-500",
                          "text-amber-500",
                          "text-slate-400",
                        ];
                        const bars = [
                          "bg-green-500",
                          "bg-blue-500",
                          "bg-amber-500",
                          "bg-slate-400",
                        ];
                        const color = colors[Math.min(index, 3)];
                        const bar = bars[Math.min(index, 3)];
                        return (
                          <tr
                            key={index}
                            className="border-b border-slate-100 dark:border-slate-700 last:border-0"
                          >
                            <td
                              className={`px-3 py-2 font-semibold whitespace-nowrap ${color}`}
                            >
                              {index + 1}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <Avatar
                                  nombre={resultado.candidato?.nombre}
                                  foto={resultado.candidato?.fotoPerfil}
                                  size="xs"
                                  shape="circle"
                                />
                                <div className="min-w-0">
                                  <div className="font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                                    {resultado.candidato?.nombre}
                                  </div>
                                  <div
                                    className={`h-1 rounded-full mt-0.5 ${bar}`}
                                    style={{
                                      width: `${Math.max(resultado.porcentaje, 2)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-300 whitespace-nowrap">
                              {resultado.votos}
                            </td>
                            <td
                              className={`px-3 py-2 text-right font-bold whitespace-nowrap ${color}`}
                            >
                              {resultado.porcentaje}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ── Stats footer ── */}
            {resultados.resultados?.length > 0 && (
              <div className="grid grid-cols-3 gap-2 px-3 pb-2">
                {/* <div className="grid grid-cols-3 gap-2 px-6 pb-4"> */}
                <div className="bg-slate-200 dark:bg-slate-700 rounded-xl p-2 text-center">
                  <Trophy className="w-4 h-4 mx-auto text-yellow-500 mb-0.5" />
                  <p className="text-xs text-slate-600 dark:text-slate-100">
                    Ganador
                  </p>
                  <p className="text-xs font-semibold text-sky-900 dark:text-sky-400 leading-tight truncate">
                    {resultados.resultados[0]?.candidato?.nombre
                      ?.split(" ")
                      .slice(0, 2)
                      .join(" ")}
                  </p>
                </div>
                <div className="bg-slate-200 dark:bg-slate-700 rounded-xl p-2 text-center">
                  <TrendingUp className="w-4 h-4 mx-auto text-green-500 mb-0.5" />
                  <p className="text-xs text-slate-600 dark:text-slate-100">
                    Mayor %
                  </p>
                  <p className="text-sm font-semibold text-teal-600 dark:text-teal-300">
                    {resultados.resultados[0]?.porcentaje}%
                  </p>
                </div>
                <div className="bg-slate-200 dark:bg-slate-700 rounded-xl p-2 text-center">
                  <Users className="w-4 h-4 mx-auto text-blue-500 mb-0.5" />
                  <p className="text-xs text-slate-600 dark:text-slate-100">
                    Participación
                  </p>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                    {resultados.eleccion?.totalVotantes || 0} votos
                  </p>
                </div>
              </div>
            )}
          </div>{" "}
          {/* ← cierre del rounded-2xl, ahora envuelve TODO */}
        </div>
      )}
    </>
  );
};

export default EstadisticasAdmin;
