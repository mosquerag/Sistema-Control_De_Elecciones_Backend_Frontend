/**
 * ARCHIVO: home/index.jsx
 * UBICACIÓN: /frontend/src/pages/home/index.jsx
 */

// import ConoceCandidatos from "@/components/candidato/ConoceCandidatos";
import ConoceCandidatos from "@/components/ConoceCandidatos";
import ControlVotaciones from "@/components/ControlVotaciones";
import Caracteristicas from "@/components/Caracteristicas";
import Encuesta from "@/components/Encuesta";
import Actividad from "@/components/Actividad";
import Propaganda from "@/components/Propaganda";

function Home() {
  return (
    <div
      className="home-section min-h-screen flex flex-col items-center justify-center
                    bg-gradient-to-br from-[var(--color-base)] to-[var(--color-surface)]
                    dark:from-[var(--color-base)] dark:to-[var(--color-surface)]
                    text-[var(--color-text)] transition-colors duration-300"
    >
      <Propaganda />
      <ConoceCandidatos />
      <ControlVotaciones />
      <Caracteristicas />
      <Encuesta />
      <Actividad />
    </div>
  );
}

export default Home;
