import { useState, useEffect } from "react";
import Button from "./common/Button";
import Card from "./common/Card";
import Loader from "./common/Loader";
import EmptyState from "./common/EmptyState";
import Avatar from "./common/Avatar";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  Briefcase,
} from "lucide-react";
import { getCandidatos } from "@/api/candidatos";

function ConoceCandidatos() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarCandidatos();
  }, []);

  const cargarCandidatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCandidatos();

      const candidatosActivos = (
        response.data?.data ||
        response.data ||
        []
      ).filter((c) => c.activo !== false && c.estado === "activo");

      const formateados = candidatosActivos.map((c) => ({
        id: c._id,
        name: c.nombre,
        party: c.partido || "Independiente",
        position: c.idEleccion?.titulo || "Candidato",
        photo: c.fotoPerfil || null,
        proposals: c.propuestas
          ? c.propuestas
              .split("\n")
              .filter((p) => p.trim())
              .slice(0, 3)
          : ["Sin propuestas registradas"],
        experience: `Candidato registrado en ${new Date(c.createdAt).getFullYear()}`,
        email: c.email || "No disponible",
        phone: c.telefono || "No disponible",
      }));

      setCandidates(formateados);
    } catch {
      setError("No se pudieron cargar los candidatos");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (candidates.length === 0) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % candidates.length);
        setIsAnimating(false);
      }, 300);
    }, 10000);
    return () => clearInterval(interval);
  }, [candidates.length]);

  const goTo = (fn) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(fn);
      setIsAnimating(false);
    }, 300);
  };

  if (loading) {
    return (
      <section
        id="conoce-candidatos"
        className="w-full flex items-center justify-center p-8 min-h-[500px]"
      >
        <Loader size="lg" mensaje="Cargando candidatos..." />
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="conoce-candidatos"
        className="w-full flex items-center justify-center p-8 min-h-[400px]"
      >
        <Card className="text-center p-8 max-w-md">
          <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <EmptyState
            title="Error al cargar candidatos"
            description={error}
            action={
              <Button onClick={cargarCandidatos} variant="primary">
                Reintentar
              </Button>
            }
          />
        </Card>
      </section>
    );
  }

  if (candidates.length === 0) {
    return (
      <section
        id="conoce-candidatos"
        className="w-full flex items-center justify-center p-8 min-h-[400px]"
      >
        <Card className="text-center p-8 max-w-md">
          <EmptyState
            icon={User}
            title="No hay candidatos disponibles"
            description="Aún no hay candidatos registrados para mostrar"
          />
        </Card>
      </section>
    );
  }

  const current = candidates[currentIndex];

  const MAX_DOTS = 5;
  const totalDots = Math.min(MAX_DOTS, candidates.length);
  const dotStart = Math.max(
    0,
    Math.min(
      currentIndex - Math.floor(MAX_DOTS / 2),
      candidates.length - MAX_DOTS,
    ),
  );
  const visibleDots = Array.from({ length: totalDots }, (_, i) => dotStart + i);

  return (
    <div id="conoce-candidatos" className="w-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br bg-blue-950 dark:bg-slate-800 text-center py-10 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
          Conoce a los Candidatos
        </h1>
        <p className="text-gray-100 dark:text-blue-400 text-sm uppercase tracking-widest font-medium">
          {candidates.length}{" "}
          {candidates.length === 1
            ? "candidato registrado"
            : "candidatos registrados"}
        </p>
      </div>

      {/* Split layout: foto | info — contenedor externo NUNCA se anima */}
      {/* <div className="relative flex flex-col md:flex-row min-h-[520px] bg-blue-950 dark:bg-slate-800"> */}
      <div className="relative min-h-[800px] md:min-h-[520px] bg-blue-950 dark:bg-slate-800">
        {/* Contenido animado */}
        <div
          className={`absolute inset-0 flex flex-col md:flex-row transition-opacity duration-300 ease-out ${
            isAnimating ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* ── Mitad izquierda: FOTO ── */}
          {/* <div className="relative w-full md:w-1/2 min-h-[320px] md:min-h-[520px] overflow-hidden bg-blue-950 dark:bg-slate-800"> */}
          <div className="relative w-full md:w-1/2 h-[380px] md:h-auto overflow-hidden bg-blue-950 dark:bg-slate-800">
            {current.photo ? (
              <img
                src={current.photo}
                alt={current.name}
                className="absolute inset-0 w-full h-full object-cover object-center"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-950 dark:bg-slate-800">
                <Avatar
                  nombre={current.name}
                  size="xl"
                  shape="rounded"
                  gradient="from-blue-500 to-purple-600"
                  className="w-40 h-40"
                />
              </div>
            )}
            {/* gradiente derecha para fusionar con el lado info */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-blue-800/60 hidden md:block" />
            {/* gradiente abajo para mobile */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-800/80 via-transparent to-transparent md:hidden" />
          </div>

          {/* ── Mitad derecha: INFO ── */}
          <div className="relative w-full md:w-1/2 bg-blue-950 dark:bg-slate-800 flex flex-col justify-center px-10 py-12 md:py-16">
            {/* Badge partido */}
            <div className="flex justify-center mb-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-blue-800 dark:bg-blue-900 text-white border border-blue-100 backdrop-blur-sm">
                {current.party}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-1">
              {current.name}
            </h2>
            <p className="text-gray-100 dark:text-blue-400 text-xs uppercase tracking-widest font-medium mb-5">
              Candidato a {current.position}
            </p>

            {/* Experiencia */}
            <div className="flex items-start gap-3 mb-7">
              <Briefcase className="text-blue-400 mt-0.5 shrink-0" size={15} />
              <p className="text-gray-100 text-sm leading-relaxed">
                {current.experience}
              </p>
            </div>

            {/* Propuestas */}
            <div className="mb-8">
              <p className="text-gray-100 dark:text-blue-400 text-xs uppercase tracking-widest font-semibold mb-3">
                Propuestas Principales
              </p>
              <ul className="space-y-2.5">
                {current.proposals.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-white/70"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span className="leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacto */}
            <div className="border-t border-blue-400 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
            </div>
          </div>
        </div>

        {/* Botones fuera del div animado para que no parpadeen */}
        {/* <button
          onClick={() =>
            goTo((p) => (p - 1 + candidates.length) % candidates.length)
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-blue-400 hover:bg-slate-600 border border-white/15 text-slate-100 flex items-center justify-center transition-all duration-100 backdrop-blur-sm shadow-lg"
          aria-label="Candidato anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => goTo((p) => (p + 1) % candidates.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-blue-400 hover:bg-slate-600 border border-white/15 text-slate-100 flex items-center justify-center transition-all duration-100 backdrop-blur-sm shadow-lg"
          aria-label="Candidato siguiente"
        >
          <ChevronRight size={20} />
        </button> */}
      </div>

      {/* Dots + contador */}
      <div className="bg-blue-950 dark:bg-slate-800 flex flex-col items-center gap-2 py-6 ">
        <div className="flex items-center gap-1.5">
          {dotStart > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
          )}
          {visibleDots.map((i) => (
            <button
              key={i}
              onClick={() => goTo(() => i)}
              aria-label={`Ir al candidato ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-6 h-2 bg-white"
                  : "w-2 h-2 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
          {dotStart + MAX_DOTS < candidates.length && (
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
          )}
        </div>
        <p className="text-white/25 text-xs tabular-nums">
          {currentIndex + 1} <span className="text-white/15">/</span>{" "}
          {candidates.length}
        </p>
      </div>
    </div>
  );
}

export default ConoceCandidatos;
