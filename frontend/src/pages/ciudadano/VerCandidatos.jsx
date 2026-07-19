/**
 * ARCHIVO: VerCandidatos.jsx
 * UBICACIÓN: /frontend/src/pages/ciudadano/VerCandidatos.jsx
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCandidatosByEleccion } from "@/api/candidatos";
import { getEleccionById } from "@/api/elecciones";
import CandidatoCard from "./CandidatoCard";
import Loader from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import BackButton from "@/components/common/BackButton";
import { manejarErrorApi } from "@/utils/alertas";
import VotarModal from "./VotarModal";

const VerCandidatos = () => {
  const { idEleccion } = useParams();
  const navigate = useNavigate();

  const [eleccion, setEleccion] = useState(null);
  const [candidatos, setCandidatos] = useState([]);
  const [candidatoSeleccionado, setCandidato] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eleccionRes, candidatosRes] = await Promise.all([
          getEleccionById(idEleccion),
          getCandidatosByEleccion(idEleccion),
        ]);
        setEleccion(eleccionRes.data?.data || eleccionRes.data);
        setCandidatos(candidatosRes.data?.data || candidatosRes.data || []);
      } catch (error) {
        manejarErrorApi(error, "Error al cargar datos");
        navigate("/ciudadano/elecciones");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [idEleccion, navigate]);

  const handleVotar = (candidato) => {
    setCandidato(candidato);
    setModalOpen(true);
  };

  const handleConfirmVotar = () => {
    navigate(`/ciudadano/votar/${idEleccion}`, {
      state: { candidato: candidatoSeleccionado },
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-5">
        <BackButton to="/ciudadano/elecciones" label="Volver a elecciones" />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
          {eleccion?.titulo}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {eleccion?.descripcion}
        </p>
      </div>

      {candidatos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidatos.map((candidato) => (
            <CandidatoCard 
              key={candidato._id}
              candidato={candidato}
              onVotar={handleVotar}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          emoji="🗳️"
          title="Sin candidatos disponibles"
          description="No hay candidatos registrados para esta elección"
        />
      )}

      <VotarModal
        isOpen={modalOpen}
        candidato={candidatoSeleccionado}
        onConfirm={handleConfirmVotar}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
};

export default VerCandidatos;
