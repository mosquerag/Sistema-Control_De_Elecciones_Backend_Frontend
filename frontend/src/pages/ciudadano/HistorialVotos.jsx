import { useState, useEffect } from "react";
import { getMisVotos } from "@/api/votos";
import { manejarErrorApi } from "@/utils/alertas";
import Loader from "@/components/common/Loader";
import PageHeader from "@/components/common/PageHeader";
import BackButton from "@/components/common/BackButton";
import FilterBar from "@/components/common/FilterBar";
import MisVotos from "./MisVotos";

const HistorialVotos = () => {
  const [votos, setVotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterFecha, setFilterFecha] = useState("todas");

  useEffect(() => {
    const loadVotos = async () => {
      try {
        const res = await getMisVotos();
        setVotos(res.data?.data || res.data || []);
      } catch (error) {
        manejarErrorApi(error, "Error al cargar historial de votos");
      } finally {
        setLoading(false);
      }
    };
    loadVotos();
  }, []);

  const filtrarPorFecha = (voto) => {
    if (filterFecha === "todas") return true;
    const fechaVoto = voto.fecha || voto.createdAt || voto.fechaVoto;
    if (!fechaVoto) return true;

    const ahora = new Date();
    const hoyUTC = `${ahora.getUTCFullYear()}-${String(ahora.getUTCMonth() + 1).padStart(2, "0")}-${String(ahora.getUTCDate()).padStart(2, "0")}`;
    const fv = new Date(fechaVoto);
    const fechaVotoUTC = `${fv.getUTCFullYear()}-${String(fv.getUTCMonth() + 1).padStart(2, "0")}-${String(fv.getUTCDate()).padStart(2, "0")}`;

    if (filterFecha === "hoy") return fechaVotoUTC === hoyUTC;

    const hoyDate = new Date(`${hoyUTC}T00:00:00.000Z`);
    const votoDate = new Date(`${fechaVotoUTC}T00:00:00.000Z`);

    if (filterFecha === "semana") {
      const limite = new Date(hoyDate);
      limite.setUTCDate(limite.getUTCDate() - 7);
      return votoDate <= hoyDate && votoDate >= limite;
    }
    if (filterFecha === "mes") {
      const limite = new Date(hoyDate);
      limite.setUTCMonth(limite.getUTCMonth() - 1);
      return votoDate <= hoyDate && votoDate >= limite;
    }
    return true;
  };

  const votosFiltrados = votos.filter((voto) => {
    const tituloEleccion =
      voto.eleccion?.titulo || voto.idEleccion?.titulo || "";
    const nombreCandidato =
      voto.candidato?.nombre || voto.idCandidato?.nombre || "";
    const matchSearch =
      searchTerm === "" ||
      tituloEleccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nombreCandidato.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch && filtrarPorFecha(voto);
  });

  if (loading) return <Loader fullScreen />;

  return (
    <>
      <PageHeader
        title="Mi Historial de Votaciones"
        action={<BackButton to="/ciudadano/dashboard" />}
      />

      <FilterBar
        showSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por elección o candidato..."
        searchLabel="Buscar"
        showFirstSelect={false}
        showSecondSelect={true}
        secondSelectValue={filterFecha}
        onSecondSelectChange={setFilterFecha}
        secondSelectOptions={[
          { value: "todas", label: "Todas las fechas" },
          { value: "hoy", label: "Hoy" },
          { value: "semana", label: "Últimos 7 días" },
          { value: "mes", label: "Último mes" },
        ]}
        secondSelectLabel="Fecha"
        filteredCount={votosFiltrados.length}
        totalCount={votos.length}
        itemLabel="votos"
        onClearFilters={() => {
          setSearchTerm("");
          setFilterFecha("todas");
        }}
      />

      <MisVotos votos={votosFiltrados} />
    </>
  );
};

export default HistorialVotos;
