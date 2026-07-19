import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getEleccionesCiudadano } from "@/api/elecciones";
import { checkVoto } from "@/api/votos";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/common/Button";
import StatusBadge from "@/components/common/StatusBadge";
import { manejarErrorApi } from "@/utils/alertas";
import { Vote, Calendar, Users } from "lucide-react";
import { formatDate, isEleccionActiva } from "@/utils/formatDate";

const EleccionesActivas = () => {
  const navigate = useNavigate();
  const [elecciones, setElecciones] = useState([]);
  const [votosMap, setVotosMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // const res = await getEleccionesActivas();
        const res = await getEleccionesCiudadano();
        const lista = res.data?.data || res.data || [];
        setElecciones(lista);

        const checks = await Promise.allSettled(
          lista.map((e) => checkVoto(e._id)),
        );
        const mapa = {};
        checks.forEach((r, i) => {
          mapa[lista[i]._id] =
            r.status === "fulfilled"
              ? (r.value.data?.data?.yaVoto ?? false)
              : false;
        });
        setVotosMap(mapa);
      } catch (error) {
        manejarErrorApi(error, "Error al cargar elecciones activas");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <>
      <PageHeader
        title="Elecciones Activas"
        description="Elecciones disponibles para emitir tu voto"
      />

      {elecciones.length === 0 ? (
        <EmptyState
          icon={Vote}
          title="No hay elecciones activas"
          description="No hay elecciones disponibles en este momento. Vuelve más tarde."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {elecciones.map((eleccion) => {
            const activa = isEleccionActiva(
              eleccion.fechaInicio,
              eleccion.fechaFin,
            );
            const yaVoto = votosMap[eleccion._id] ?? false;

            return (
              <div
                key={eleccion._id}

                className={`bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm
                  hover:shadow-md transition-all duration-200 flex flex-col gap-4
                  border-2 ${
                    // yaVoto
                    //   ? "border-green-400 dark:border-green-600"
                    //   : "border-amber-400 dark:border-amber-500"
                    yaVoto && !activa
                      ? "border-red-400 dark:border-red-500" // votó + finalizada → rojo
                      : yaVoto && activa
                        ? "border-green-400 dark:border-green-600 " // votó + activa → verde
                        : "border-amber-400 dark:border-amber-500" // no ha votado → amarillo
                  }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-3">
                  <h3 className="text-base font-bold text-gray-800 dark:text-white leading-snug flex-1">
                    {eleccion.titulo}
                  </h3>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusBadge status={activa ? "activa" : "finalizada"} />
                    {yaVoto ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                        Ya votaste
                      </span>
                    ) : activa ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                        Pendiente por votar
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Descripción */}
                {eleccion.descripcion && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {eleccion.descripcion}
                  </p>
                )}

                {/* Info */}
                <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                  <p className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      Tipo:
                    </span>
                    {eleccion.idTipoEleccion?.nombre || "N/A"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{formatDate(eleccion.fechaInicio)}</span>
                    <span className="text-gray-400">→</span>
                    <span>{formatDate(eleccion.fechaFin)}</span>
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 dark:border-slate-700" />

                {/* Acción */}
                {!yaVoto && activa ? (
                  <Button
                    variant="success"
                    onClick={() => navigate(`/ciudadano/votar/${eleccion._id}`)}
                    className="w-full"
                  >
                    Votar Ahora
                  </Button>
                ) : (
                  <Button
                    variant="info"
                    onClick={() =>
                      navigate(`/ciudadano/resultados/${eleccion._id}`)
                    }
                    className="w-full"
                  >
                    Ver Resultados
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default EleccionesActivas;
