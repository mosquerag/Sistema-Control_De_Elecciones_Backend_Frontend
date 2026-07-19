
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getResultadosEleccion } from "@/api/estadisticas";
import { mostrarAlerta } from "@/utils/alertas";
import Loader from "@/components/common/Loader";
import BackButton from "@/components/common/BackButton";
import Avatar from "@/components/common/Avatar";
import EmptyState from "@/components/common/EmptyState";
import { BarChart3 } from "lucide-react";

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

    const loadChart = async () => {
      if (!window.Chart) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
        script.onload = () => buildChart();
        document.head.appendChild(script);
      } else {
        buildChart();
      }
    };

    const buildChart = () => {
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
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: false,
          cutout: "70%",
          plugins: { legend: { display: false }, tooltip: { enabled: true } },
        },
      });
    };

    loadChart();
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [resultados]);

  return (
    <canvas
      ref={canvasRef}
      width={140}
      height={140}
      role="img"
      aria-label="Distribución de votos entre candidatos"
    />
  );
};

const ResultadosPublicos = () => {
  const { idEleccion } = useParams();
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResultados = async () => {
      try {
        const res = await getResultadosEleccion(idEleccion);
        setResultados(res.data?.data || res.data);
      } catch {
        mostrarAlerta("error", "Error", "No se pudieron cargar los resultados");
      } finally {
        setLoading(false);
      }
    };
    loadResultados();
  }, [idEleccion]);

  if (loading) return <Loader fullScreen />;

  return (
    <>
      <div className="mb-4">
        <BackButton to="/ciudadano/elecciones" label="Volver a elecciones" />
      </div>

      {resultados && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                {resultados.eleccion?.titulo}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                Distribución de votos
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-200">
                Total votantes
              </p>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {resultados.eleccion?.totalVotantes || 0}
              </p>
            </div>
          </div>

          {/* ── Sin resultados ── */}
          {resultados.resultados?.length === 0 && (
            <div className="p-8">
              <EmptyState
                icon={BarChart3}
                title="Aún no hay votos registrados"
                description="Los resultados aparecerán aquí cuando los ciudadanos comiencen a votar"
              />
            </div>
          )}

          {/* ── Body ── */}
          {resultados.resultados?.length > 0 && (
            <div className="flex flex-col md:flex-row">
              {/* Columna izquierda: dona + leyenda */}
              <div className="flex flex-col items-center justify-center gap-5 px-6 py-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 md:min-w-[220px]">
                <DonutChart resultados={resultados.resultados} />

                <div className="flex flex-col gap-2 w-full">
                  {resultados.resultados.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-sm flex-shrink-0"
                        style={{
                          background: COLORES[Math.min(i, COLORES.length - 1)],
                        }}
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-300 flex-1 truncate">
                        {r.candidato?.nombre?.split(" ").slice(0, 2).join(" ")}
                      </span>
                      <span
                        className={`text-xs font-semibold ${PCT_COLORS[Math.min(i, PCT_COLORS.length - 1)]}`}
                      >
                        {r.porcentaje}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Columna derecha: barras horizontales */}
              <div className="flex-1 px-6 py-6">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-4">
                  Resultados por candidato
                </p>

                <div className="flex flex-col gap-4">
                  {resultados.resultados.map((resultado, index) => {
                    const bar = COLORES[Math.min(index, COLORES.length - 1)];
                    const pctClr =
                      PCT_COLORS[Math.min(index, PCT_COLORS.length - 1)];

                    return (
                      <div key={index} className="flex items-center gap-3">
                        {/* Posición */}
                        <span
                          className={`text-xs font-semibold min-w-[16px] ${
                            index === 0
                              ? "text-teal-500"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {index + 1}
                        </span>

                        {/* Avatar */}
                        <Avatar
                          nombre={resultado.candidato?.nombre}
                          foto={resultado.candidato?.fotoPerfil}
                          size="sm"
                          shape="circle"
                        />

                        {/* Info + barra */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                            {resultado.candidato?.nombre}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                            {resultado.candidato?.partido}
                          </p>
                          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 mt-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${Math.max(resultado.porcentaje, 1)}%`,
                                background: bar,
                              }}
                            />
                          </div>
                        </div>

                        {/* Porcentaje + votos */}
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-bold ${pctClr}`}>
                            {resultado.porcentaje}%
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-300">
                            {resultado.votos} votos
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer ganador */}
                <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="bg-slate-200 dark:bg-slate-700 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-200 mb-1">
                      Ganador
                    </p>
                    <p className="text-xs font-semibold text-sky-900 dark:text-sky-400 leading-tight">
                      {resultados.resultados[0]?.candidato?.nombre
                        ?.split(" ")
                        .slice(0, 2)
                        .join(" ")}
                    </p>
                  </div>
                  <div className="bg-slate-200 dark:bg-slate-700 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-200 mb-1">
                      Mayor %
                    </p>
                    <p className="text-sm font-semibold text-teal-600 dark:text-teal-300">
                      {resultados.resultados[0]?.porcentaje}%
                    </p>
                  </div>
                  <div className="bg-slate-200 dark:bg-slate-700 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-200 mb-1">
                      Participación
                    </p>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                      {resultados.eleccion?.totalVotantes || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ResultadosPublicos;
