import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Hero from "@/components/Hero";
// import Timeline from "@/components/Timeline";
import Propaganda from "@/components/Propaganda";
import ConoceCandidatos from "@/components/ConoceCandidatos";
import ControlVotaciones from "@/components/ControlVotaciones";
import Caracteristicas from "@/components/Caracteristicas";
import Encuesta from "@/components/Encuesta";
import Actividad from "@/components/Actividad";

function Home() {
  useEffect(() => {
    AOS.init({ duration: 700, once: true, offset: 60 });
  }, []);

  return (
    <div
      className="home-section min-h-screen flex flex-col bg-slate-100 text-slate-900 transition-colors duration-300"
    >
      <Hero />
      <Propaganda />
      <ConoceCandidatos />
      {/* <Timeline /> */}
      <ControlVotaciones />
      <Caracteristicas />
      <Encuesta />
      <Actividad />
    </div>
  );
}

export default Home;
