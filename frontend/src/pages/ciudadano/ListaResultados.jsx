/**
 * ARCHIVO: ListaResultados.jsx
 * UBICACIÓN: /frontend/src/pages/ciudadano/ListaResultados.jsx
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getElecciones } from "@/api/elecciones";
import { manejarErrorApi } from "@/utils/alertas";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import { formatDate } from "@/utils/formatDate";

const ListaResultados = () => {
  const [elecciones, setElecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarElecciones = async () => {
      try {
        const res = await getElecciones();
        setElecciones(res.data || []);
      } catch (error) {
        manejarErrorApi(error, "Error al cargar elecciones");
      } finally {
        setLoading(false);
      }
    };
    cargarElecciones();
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">📊</span>
            Resultados Públicos
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Consulta los resultados de todas las elecciones
          </p>
        </div>

        {elecciones.length === 0 ? (
          <div className="text-center py-16">
            <EmptyState
              emoji="📊"
              title="No hay elecciones disponibles"
              description="Los resultados aparecerán aquí cuando las elecciones finalicen"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {elecciones.map((eleccion) => (
              <div
                key={eleccion._id}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200
                           dark:border-gray-700 p-6 border-l-4 border-l-green-500
                           hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {eleccion.titulo}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  {eleccion.descripcion}
                </p>

                <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300 mb-5">
                  <p>
                    <span className="font-semibold">Tipo:</span>{" "}
                    {eleccion.idTipoEleccion?.nombre || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Inicio:</span>{" "}
                    {formatDate(eleccion.fechaInicio)}
                  </p>
                  <p>
                    <span className="font-semibold">Fin:</span>{" "}
                    {formatDate(eleccion.fechaFin)}
                  </p>
                  <p>
                    <span className="font-semibold">Total Votantes:</span>{" "}
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      {eleccion.totalVotantes || 0}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate(`/ciudadano/resultados/${eleccion._id}`)
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white
                             py-2.5 px-4 rounded-xl font-semibold text-sm
                             transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <span>📊</span> Ver Resultados
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaResultados;
