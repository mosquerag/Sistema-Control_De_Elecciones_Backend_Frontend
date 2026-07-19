

import { useNavigate } from "react-router-dom";
import { formatDate, isEleccionActiva } from "../utils/formatDate";
import Button from "./common/Button";

const EleccionCard = ({
  eleccion,
  yaVoto,
  onVerCandidatos,
  onVerResultados,
}) => {
  const navigate = useNavigate();
  const activa = isEleccionActiva(eleccion.fechaInicio, eleccion.fechaFin);

  // Función para navegar a la página de votación
  const handleVotar = () => {
    navigate(`/ciudadano/votar/${eleccion._id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-primary">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold text-gray-800">{eleccion.titulo}</h3>
        {yaVoto && (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
            ✅ Ya votaste
          </span>
        )}
      </div>

      <p className="text-gray-600 mb-4">{eleccion.descripcion}</p>

      <div className="space-y-2 text-sm mb-6">
        <p>
          <span className="font-semibold">Tipo:</span>{" "}
          {eleccion.idTipoEleccion?.nombre || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Inicia:</span>{" "}
          {formatDate(eleccion.fechaInicio)}
        </p>
        <p>
          <span className="font-semibold">Finaliza:</span>{" "}
          {formatDate(eleccion.fechaFin)}
        </p>
        <p>
          <span className="font-semibold">Estado:</span>{" "}
          <span
            className={activa ? "text-green-600 font-semibold" : "text-red-600"}
          >
            {activa ? "En curso" : "Finalizada"}
          </span>
        </p>
      </div>

      {/* BOTONES CON COMPONENTE BUTTON */}
      <div className="flex gap-2">
        {!yaVoto && activa ? (
          <Button variant="success" onClick={handleVotar} className="flex-1">
            🗳️ Votar Ahora
          </Button>
        ) : (
          <Button
            variant="info"
            onClick={() => onVerResultados(eleccion._id)}
            className="flex-1"
          >
            📊 Ver Resultados
          </Button>
        )}
      </div>
    </div>
  );
};

export default EleccionCard;
