import { useState, useEffect } from "react";
import { getElecciones } from "@/api/elecciones";
import { getResultadosEleccion } from "@/api/estadisticas";
import { mostrarAlerta } from "@/utils/alertas";
import Loader from "@/components/common/Loader";
import Card from "@/components/common/Card";
import { Trophy, TrendingUp, Users, ArrowLeft, Search } from "lucide-react";
import { Sidebar } from "@/components/common/Sidebar";
import { Home as HomeIcon, Vote, BarChart3 } from "lucide-react";
import { TopBar } from "@/components/common/TopBar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import FilterBar from "@/components/common/FilterBar";

const EleccionListTotal = () => {
  const navigate = useNavigate();
  const [elecciones, setElecciones] = useState([]);
  const [eleccionSeleccionada, setEleccionSeleccionada] = useState("todas");
  const [todasLasElecciones, setTodasLasElecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ NUEVO

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState("estadisticas");

  const { user } = useAuth();

  useEffect(() => {
    loadTodasLasElecciones();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const loadTodasLasElecciones = async () => {
    try {
      setLoading(true);
      const resElecciones = await getElecciones();
      const eleccionesData = resElecciones.data;
      setElecciones(eleccionesData);

      // Cargar resultados para TODAS las elecciones
      const eleccionesConResultados = await Promise.all(
        eleccionesData.map(async (eleccion) => {
          try {
            const resResultados = await getResultadosEleccion(eleccion._id);
            return {
              ...eleccion,
              resultados: resResultados.data,
            };
          } catch (error) {
            console.error(
              `Error al cargar resultados de ${eleccion.nombre}:`,
              error,
            );
            return {
              ...eleccion,
              resultados: null,
            };
          }
        }),
      );

      setTodasLasElecciones(eleccionesConResultados);
    // } catch (error) {
    //   mostrarAlerta("Error al cargar elecciones: " + error.message, "error");
    //   console.error("Error:", error);
    // } finally {
    } catch (error) {
      mostrarAlerta("error", "No se pudieron cargar las elecciones", error.message);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEleccion = (e) => {
    setEleccionSeleccionada(e.target.value);
  };

  // ACTUALIZADO: Filtrar elecciones según selección Y búsqueda
  const eleccionesMostradas = todasLasElecciones.filter((eleccion) => {
    // Filtro por selección de dropdown
    const matchDropdown =
      eleccionSeleccionada === "todas" || eleccion._id === eleccionSeleccionada;

    // Filtro por búsqueda
    const matchSearch =
      searchTerm === "" ||
      eleccion.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eleccion.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eleccion.fechaInicio?.includes(searchTerm);

    return matchDropdown && matchSearch;
  });

  const getColorByPosition = (index) => {
    const colors = [
      "bg-yellow-500",
      "bg-gray-400",
      "bg-orange-600",
      "bg-blue-500",
    ];
    return colors[Math.min(index, 3)];
  };

  const getMedal = (index) => {
    const medals = ["🥇", "🥈", "🥉"];
    return medals[index] || "";
  };

  if (loading) return <Loader fullScreen />;

  const usuario = {
    name: user?.nombre || "Usuario",
    username: user?.email?.split("@")[0] || "usuario",
    initials: user?.nombre?.substring(0, 2).toUpperCase() || "US",
    plan: "Premium",
    isOnline: true,
    hasNotifications: false,
  };


  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        menuItems={sidebarMenuItems}
      />

      <div className="flex-1 overflow-auto">
        <TopBar
          userData={usuario}
          isMobile={isMobile}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="p-2 md:p-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] items-start md:items-center gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Estadísticas y Resultados4345435
            </h1>
            <Button
              variant="secondary"
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-100 transition-colors justify-self-start md:justify-self-end"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver</span>
            </Button>
          </div>

          {/* ✅ NUEVO: Buscador y Selector */}
          <div className="space-y-4 mb-4">
            {/* FILTROS CON COMPONENTE REUTILIZABLE */}
            <FilterBar
              showSearch={true}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Buscar por nombre o título..."
              searchLabel="Buscar elección"
              showFirstSelect={true}
              firstSelectValue={eleccionSeleccionada}
              onFirstSelectChange={setEleccionSeleccionada}
              firstSelectOptions={[
                { value: "todas", label: "🌟 Ver todas las elecciones" },
                ...elecciones.map((eleccion) => ({
                  value: eleccion._id,
                  label: eleccion.nombre || eleccion.titulo,
                })),
              ]}
              firstSelectLabel="Seleccionar Elección"
              firstSelectIcon={<Vote className="w-5 h-5" />}
              filteredCount={eleccionesMostradas.length}
              totalCount={todasLasElecciones.length}
              itemLabel="elecciones"
              onClearFilters={() => {
                setSearchTerm("");
                setEleccionSeleccionada("todas");
              }}
            />
          </div>

          {/* Mensaje cuando no hay elecciones */}
          {eleccionesMostradas.length === 0 && (
            <Card className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-semibold">
                {searchTerm !== ""
                  ? "No se encontraron elecciones"
                  : "No hay elecciones disponibles"}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm !== ""
                  ? "Intenta con otros criterios de búsqueda"
                  : "Crea una elección para ver las estadísticas"}
              </p>
            </Card>
          )}

          {/* Mostrar elecciones filtradas */}
          {eleccionesMostradas.map((eleccion, eleccionIndex) => (
            <div key={eleccion._id} className="space-y-6">
              {/* Separador visual entre elecciones */}
              {eleccionIndex > 0 && (
                <div className="border-t-4 border-gray-300 my-8"></div>
              )}

              {/* Información General de la Elección */}
              <Card className="p-6">
                <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                      {eleccion.nombre || eleccion.titulo}
                    </h2>
                    <p className="text-gray-600">
                      {eleccion.descripcion ||
                        "Resultados oficiales de la elección"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                    <Users className="w-5 h-5" />
                    <div>
                      <p className="text-xs font-medium">Total Votantes</p>
                      <p className="text-xl font-bold">
                        {eleccion.resultados?.eleccion?.totalVotantes || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lista de Resultados */}
                <div className="space-y-4 mb-2">
                  {eleccion.resultados?.resultados &&
                  eleccion.resultados.resultados.length > 0 ? (
                    eleccion.resultados.resultados.map((resultado, index) => (
                      <div
                        key={`${eleccion._id}-${index}`}
                        className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                          {/* Posición y Candidato */}
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                              <span className="text-4xl font-bold text-gray-400">
                                {index + 1}º
                              </span>
                              <span className="text-3xl">
                                {getMedal(index)}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-xl text-gray-800">
                                {resultado.candidato.nombre}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                                {resultado.candidato.partido}
                              </p>
                            </div>
                          </div>

                          {/* Estadísticas */}
                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end mb-1">
                              <TrendingUp className="w-5 h-5 text-green-500" />
                              <p className="text-4xl font-bold text-blue-600">
                                {resultado.porcentaje}%
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">
                              {resultado.votos.toLocaleString()} votos
                            </p>
                          </div>
                        </div>

                        {/* Barra de Progreso */}
                        <div className="mt-4">
                          <div className="bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                            <div
                              className={`${getColorByPosition(
                                index,
                              )} h-full transition-all duration-1000 ease-out flex items-center justify-end pr-3`}
                              style={{ width: `${resultado.porcentaje}%` }}
                            >
                              <span className="text-white text-xs font-bold">
                                {resultado.porcentaje > 10 &&
                                  `${resultado.porcentaje}%`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Card className="text-center py-12">
                      <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg font-semibold">
                        No hay resultados disponibles
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Esta elección aún no tiene votos registrados
                      </p>
                    </Card>
                  )}
                </div>

                {/* Resumen Estadístico */}
                {eleccion.resultados?.resultados &&
                  eleccion.resultados.resultados.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-6 text-center">
                        <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Ganador</p>
                        <p className="text-xl font-bold text-gray-800">
                          {eleccion.resultados.resultados[0]?.candidato.nombre}
                        </p>
                      </Card>

                      <Card className="p-6 text-center">
                        <TrendingUp className="w-8 h-8 mx-auto text-green-500 mb-2" />
                        <p className="text-sm text-gray-600 mb-1">
                          Mayor Porcentaje
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          {eleccion.resultados.resultados[0]?.porcentaje}%
                        </p>
                      </Card>

                      <Card className="p-6 text-center">
                        <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                        <p className="text-sm text-gray-600 mb-1">
                          Participación
                        </p>
                        <p className="text-xl font-bold text-gray-800">
                          {eleccion.resultados.eleccion.totalVotantes || 0}{" "}
                          votos
                        </p>
                      </Card>
                    </div>
                  )}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EleccionListTotal;
