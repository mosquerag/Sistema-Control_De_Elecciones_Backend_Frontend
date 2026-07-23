/**
 * ARCHIVO: Votar.jsx
 * UBICACIÓN: /frontend/src/pages/ciudadano/Votar.jsx
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getCandidatosByEleccion } from "@/api/candidatos";
import { getEleccionById } from "@/api/elecciones";
import { votar, checkVoto } from "@/api/votos";
import Loader from "@/components/common/Loader";
import BackButton from "@/components/common/BackButton";
import Avatar from "@/components/common/Avatar";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import {
  mostrarAlerta,
  confirmarAccion,
  manejarErrorApi,
} from "@/utils/alertas";
import { CheckCircle, Vote } from "lucide-react";

const Votar = () => {
  const { idEleccion } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [eleccion, setEleccion] = useState(null);
  const [candidatos, setCandidatos] = useState([]);
  const [yaVoto, setYaVoto] = useState(false);
  const [candidatoSelec, setCandidato] = useState(
    location.state?.candidato || null,
  );
  const [loading, setLoading] = useState(true);
  const [votando, setVotando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [eleccionRes, candidatosRes, checkRes] = await Promise.all([
          getEleccionById(idEleccion),
          getCandidatosByEleccion(idEleccion),
          checkVoto(idEleccion),
        ]);

        setEleccion(eleccionRes.data?.data || eleccionRes.data);
        setCandidatos(candidatosRes.data?.data || candidatosRes.data || []);
        setYaVoto(checkRes.data?.data?.yaVoto ?? false);
      } catch (error) {
        manejarErrorApi(error, "Error al cargar datos de la elección");
        navigate("/ciudadano/elecciones");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [idEleccion, navigate]);

  const handleVotar = () => {
    if (!candidatoSelec) {
      mostrarAlerta(
        "warning",
        "Selecciona un candidato",
        "Debes seleccionar un candidato antes de votar",
      );
      return;
    }

    confirmarAccion(
      "¿Confirmas tu voto?",
      `Estás a punto de votar por ${candidatoSelec.nombre} del partido ${candidatoSelec.partido}.  Esta acción no se puede deshacer.`,
      async () => {
        setVotando(true);
        try {
          await votar({ idEleccion, idCandidato: candidatoSelec._id });
          mostrarAlerta(
            "success",
            "¡Voto registrado!",
            `Tu voto por ${candidatoSelec.nombre} ha sido registrado exitosamente.`,
            3000,
          );
          setTimeout(() => navigate("/ciudadano/historial"), 2500);
        } catch (error) {
          manejarErrorApi(error, "Error al registrar el voto");
        } finally {
          setVotando(false);
        }
      },
    );
  };

  if (loading) return <Loader fullScreen />;

  // Ya votó
  if (yaVoto) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            ¡Ya emitiste tu voto!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Ya participaste en esta elección.
          </p>
          <Button
            onClick={() => navigate(`/ciudadano/resultados/${idEleccion}`)}
            variant="primary"
          >
            Ver Resultados
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-5">
        <BackButton to="/ciudadano/elecciones" label="Volver a elecciones" />
      </div>

      {/* Header de la elección */}
      {/* <div className="flex justify-between items-center p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
          🗳️ {eleccion?.titulo}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {eleccion?.descripcion}
        </p>
      </div> */}

      <div class="flex justify-between items-center mb-3 ">
        <div>
          <h1 class="text-3xl font-bold text-blue-800 dark:text-blue-400">
            🗳️ {eleccion?.titulo}
          </h1>
          <p class="text-blue-600 dark:text-blue-200 mt-1 text-sm">
            {eleccion?.descripcion}
          </p>
        </div>
      </div>

      {/* Lista de candidatos */}
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
        Selecciona tu candidato:
      </h2>

      {candidatos.length === 0 ? (
        <EmptyState
          icon={Vote}
          title="Sin candidatos"
          description="No hay candidatos registrados para esta elección"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {candidatos.map((candidato) => {
            const seleccionado = candidatoSelec?._id === candidato._id;
            return (
              <button
                key={candidato._id}
                type="button"
                onClick={() => setCandidato(candidato)}
                className={`relative flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all duration-200
            ${
              seleccionado
                ? "border-green-500 bg-green-200 dark:bg-green-900/20 shadow-md"
                : "border-blue-500 dark:border-blue-400 bg-blue-100 dark:bg-blue-800/60 hover:border-blue-300 hover:shadow-sm"
            }`}
              >
                {seleccionado && (
                  <span className="absolute top-2 right-2 text-xs bg-blue-400 dark:bg-blue-700 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    Seleccionado
                  </span>
                )}

                <Avatar
                  nombre={candidato.nombre}
                  foto={candidato.fotoPerfil}
                  size="lg"
                  shape="circle"
                  className="mb-3"
                />

                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight mb-1">
                  {candidato.nombre}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {candidato.partido}
                </p>
              </button>
            );
          })}
        </div>
      )}
      {/* Botón de voto */}
      {candidatos.length > 0 && (
        <div className="sticky bottom-4">
          <Button
            onClick={handleVotar}
            disabled={!candidatoSelec || votando}
            loading={votando}
            variant="success"
            size="lg"
            className="w-full shadow-lg"
          >
            {votando
              ? "Registrando voto..."
              : `Confirmar Voto${candidatoSelec ? ` por ${candidatoSelec.nombre}` : ""}`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Votar;
