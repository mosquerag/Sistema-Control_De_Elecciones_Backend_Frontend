
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Avatar from "../../components/common/Avatar";

const CandidatoCard = ({ candidato, onVotar }) => {

  return (
    <Card noHover className="hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <Avatar
            nombre={candidato.nombre}
            foto={candidato.fotoPerfil}
            size="lg"
            shape="rounded"
            gradient="from-green-400 to-blue-500"
          />
        </div>

        {/* Información */}
        <div className="flex-1 text-center sm:text-left">
          {/* Nombre */}
          <h3 className="text-lg md:text-xl font-bold text-gray-700 dark:text-white mb-1 line-clamp-2">
            {candidato.nombre}
          </h3>

          {/* Partido */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            <span className="font-semibold">Partido:</span>{" "}
            <span className="text-gray-700 dark:text-gray-300">{candidato.partido}</span>
          </p>

          {/* Propuestas */}
          <div className="bg-blue-100 dark:bg-blue-950 rounded-lg p-3 mb-3">
            <span className="font-semibold">Propuesta:</span>{" "}
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">
              {candidato.propuestas}
            </p>
          </div>

          {/* Botón */}
          <Button
            onClick={() => onVotar(candidato)}
            variant="success"
            className="w-full sm:w-auto px-6 py-2 rounded-lg font-semibold text-sm"
          >
            🗳️ Votar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CandidatoCard;
