import React from "react";
import { useState, useEffect } from "react";
import { getResultadosCandidato } from "@/api/estadisticas";
import { mostrarAlerta } from "@/utils/alertas";
import Loader from "@/components/common/Loader";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import Button from "@/components/common/Button";
import Avatar from "@/components/common/Avatar";
import { RefreshCw, Info, Trophy } from "lucide-react";

const MisResultados = () => {
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualiz] = useState(false);

  const loadResultados = async ({ showAlert = false } = {}) => {
    if (showAlert) setActualiz(true);
    try {
      const res = await getResultadosCandidato();
      const data = res.data?.data || res.data;
      setResultados(data);
      if (showAlert) mostrarAlerta("success", "Resultados actualizados");
    } catch {
      if (showAlert)
        mostrarAlerta(
          "error",
          "Error",
          "No se pudieron actualizar los resultados",
        );
    } finally {
      setLoading(false);
      setActualiz(false);
    }
  };

  useEffect(() => {
    loadResultados();
    const interval = setInterval(() => loadResultados(), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader fullScreen />;

  const misResultados = resultados?.misResultados;
  const eleccion = resultados?.eleccion;
  const ranking = resultados?.resultados || [];
  const miCandidato = resultados?.candidato;

  const candidatosConVotos = ranking.map((r) => ({
    candidato: r.candidato,
    votos: r.votos,
    porcentaje: r.porcentaje,
  }));

  const barColors = [
    "bg-green-500",
    "bg-blue-500",
    "bg-amber-500",
    "bg-slate-400",
  ];
  const pctColors = [
    "text-green-600 dark:text-green-400",
    "text-blue-500 dark:text-blue-400",
    "text-amber-500 dark:text-amber-400",
    "text-slate-400",
  ];

  const radius = 46;
  const circum = 2 * Math.PI * radius;
  const pct = parseFloat(misResultados?.porcentaje) || 0;
  const dashArr = `${(pct / 100) * circum} ${circum}`;

  return (
    <>
      <div className="mb-4">
        <BackButton />
      </div>

      <PageHeader
        title="Mis Resultados"
        action={
          <Button
            onClick={() => loadResultados({ showAlert: true })}
            disabled={actualizando}
            variant="primary"
            className="flex items-center gap-2 !bg-orange-700"
          >
            <RefreshCw
              className={`w-4 h-4 ${actualizando ? "animate-spin" : ""}`}
            />
            {actualizando ? "Actualizando..." : "Actualizar"}
          </Button>
        }
      />

      {resultados && (
        <div className="bg-blue-200 dark:bg-blue-800/60 border border-blue-500 dark:border-blue-700 rounded-2xl overflow-hidden">
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-blue-500 dark:border-blue-600">
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Mis resultados
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                {eleccion?.titulo}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-green-300 dark:bg-green-800 border border-green-400 dark:border-green-800 text-green-800 dark:text-green-300 rounded-full px-4 py-1.5 text-sm font-medium">
              <Trophy className="w-4 h-4" />
              {misResultados?.posicion}° lugar
            </div>
          </div>

          {/* ── Body ── */}
          <div className="flex flex-col md:flex-row">
            {/* Columna izquierda */}
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-6 border-b md:border-b-0 md:border-r border-blue-500 dark:border-blue-600 md:min-w-[200px]">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-white dark:text-slate-400"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#1D9E75"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={dashArr}
                    strokeDashoffset="0"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-semibold text-green-600 dark:text-green-300">
                    {pct}%
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Tu porcentaje
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {misResultados?.votos} de {eleccion?.totalVotantes} votos
                  totales
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full">
                <div className="bg-purple-500 dark:bg-purple-600 border border-purple-800 dark:border-purple-400 rounded-xl p-3 text-center">
                  <p className="text-xs text-white dark:text-slate-200 mb-1">
                    Votos
                  </p>
                  <p className="text-xl font-semibold text-green-300 dark:text-green-400">
                    {misResultados?.votos || 0}
                  </p>
                </div>
                <div className="bg-rose-300 dark:bg-rose-700 border border-rose-800 dark:border-rose-400 rounded-xl p-3 text-center">
                  <p className="text-xs text-white dark:text-slate-200 mb-1">
                    Posición
                  </p>
                  <p className="text-xl font-semibold text-green-700 dark:text-green-400">
                    {misResultados?.posicion}°
                  </p>
                </div>
              </div>
            </div>

            {/* Columna derecha: todos los candidatos */}
            <div className="flex-1 px-6 py-6">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
                Todos los candidatos
              </p>
              <div className="space-y-0">
                {candidatosConVotos.map((item, index) => {
                  const esTu = item.candidato?._id === miCandidato?._id;
                  const bar = barColors[Math.min(index, barColors.length - 1)];
                  const pctClr =
                    pctColors[Math.min(index, pctColors.length - 1)];

                  return (
                    <div
                      key={item.candidato._id}
                      className={`flex items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 ${
                        esTu
                          ? "rounded-xl bg-green-200 dark:bg-green-900 px-3 -mx-3"
                          : ""
                      }`}
                    >
                      <span
                        className={`text-xs font-semibold min-w-[16px] ${
                          index === 0
                            ? "text-green-500"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <Avatar
                        nombre={item.candidato?.nombre}
                        foto={item.candidato?.fotoPerfil}
                        size="sm"
                        shape="circle"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                            {item.candidato?.nombre}
                          </span>
                          {esTu && (
                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full px-2 py-0.5 flex-shrink-0">
                              Tú
                            </span>
                          )}
                        </div>
                        <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-700 mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${bar}`}
                            style={{
                              width: `${Math.max(item.porcentaje, 1)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold flex-shrink-0 ${pctClr}`}
                      >
                        {item.porcentaje}%
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4 mt-4 border-t border-blue-500 dark:border-blue-600">
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  Total votantes en esta elección
                </span>
                <span className="text-base font-semibold text-slate-800 dark:text-slate-100">
                  {eleccion?.totalVotantes || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
          <Info className="w-4 h-4 flex-shrink-0" />
          Los resultados se actualizan automáticamente cada 30 segundos
        </div>
      </div>
    </>
  );
};

export default MisResultados;
