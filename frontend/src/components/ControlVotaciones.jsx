import { BarChart3, Users, CheckCircle, TrendingUp } from "lucide-react";
import { useState, useEffect, } from "react";
import { getPublicStats } from "@/api/public";
import IMG5 from "@/img/IMG_5.svg";
import GlobalPresence from "./GlobalPresence";

function ControlVotaciones() {
  const [stats, setStats] = useState({
    totalVotos: 0,
    totalCiudadanos: 0,
    participacion: 0,
    totalCandidatos: 0,
    eleccionesActivas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const response = await getPublicStats();
        const d = response.data;
        setStats({
          totalVotos: d.totalVotos || 0,
          totalCiudadanos: d.totalCiudadanos || 0,
          participacion: d.participacion || 0,
          totalCandidatos: d.totalCandidatos || 0,
          eleccionesActivas: d.eleccionesActivas || 0,
        });
      } catch {
        // Silencioso — los valores se quedan en 0
      } finally {
        setLoading(false);
      }
    };
    cargarEstadisticas();
  }, []);

  const stat = (value) => (loading ? "..." : value);
  return (
    <div
      id="inicio"
      className="w-full flex flex-col items-center justify-center p-0 space-y-10 py-10 px-4 bg-slate-200/15 dark:bg-slate-700/80"
    >
      <div className=" max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        {/* LEFT */}
        <div className="animate-fadeInLeft">
          <h1 className=" text-5xl md:text-6xl font-extrabold leading-none  text-slate-800 dark:text-white  mb-5">
            Control de
            <br />
            Votaciones
            <br />
            <span className="text-blue-400">
              Seguro y
              <br />
              Transparente
            </span>
          </h1>

          <p className="text-lg text-slate-700 dark:text-slate-300 max-w-xl mb-1">
            Gestiona elecciones nacionales e internacionales con la plataforma
            más confiable del mercado. Resultados en tiempo real y máxima
            seguridad garantizada.
          </p>
          {/* <GlobalPresence/> */}
        </div>
        <div className="animate-fadeInRight animate-floating">
          <div className=" w-full border border-blue-600 rounded-3xl p-6 bg-blue-900/50 dark:bg-slate-800/50 backdrop-blur-md ">
            <div className="flex gap-2 mb-6">
              <span className="w-3 h-3 rounded-full bg-red-500 dark:bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-400 dark:bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-500" />
            </div>
            <div className="space-y-4">
              {[
                {
                  value: stat(stats.totalVotos),
                  label: "Votos Emitidos",
                  Icon: CheckCircle,
                },
                {
                  value: stat(stats.totalCiudadanos),
                  label: "Ciudadanos Registrados",
                  Icon: Users,
                },
                {
                  value: stat(stats.totalCandidatos),
                  label: "Candidatos Registrados",
                  Icon: BarChart3,
                },
              ].map(({ ref, value, label, Icon }) => (
                <div
                  ref={ref}
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-blue-600 p-5 bg-slate-950/50 dark:bg-slate-800/35 hover:translate-x-1 transition duration-300 "
                >
                  <div>
                    <div className=" text-4xl font-bold text-blue-400 ">
                      {value}
                    </div>
                    <div className="text-slate-300 text-lg">{label}</div>
                  </div>

                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
              ))}
            </div>

            {/* PARTICIPACION */}
            <div className="mt-6 rounded-2xl border border-blue-600 p-6 bg-slate-950/50 dark:bg-slate-800/35">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-300">Nivel de Participación</span>
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>

              <div className="text-5xl font-bold text-blue-400  mb-4 ">
                {stat(`${stats.participacion}%`)}
              </div>

              <div className="w-full h-3 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-blue-400 relative overflow-hidden"
                  style={{
                    width: `${stats.participacion}%`,
                  }}
                >
                  <div className=" absolute inset-0 shimmer " />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.4),
            transparent
          );

          animation: shimmerMove 1.8s infinite;
        }

        @keyframes shimmerMove {
          from {
            transform: translateX(-100%);
          }

          to {
            transform: translateX(250%);
          }
        }
      `}</style>
    </div>
  );
}

export default ControlVotaciones;
