// /**
//  * ARCHIVO: home/index.jsx
//  * UBICACIÓN: /frontend/src/pages/home/index.jsx
//  */

// // import ConoceCandidatos from "@/components/candidato/ConoceCandidatos";
// import ConoceCandidatos from "@/components/ConoceCandidatos";
// import ControlVotaciones from "@/components/ControlVotaciones";
// import Caracteristicas from "@/components/Caracteristicas";
// import Encuesta from "@/components/Encuesta";
// import Actividad from "@/components/Actividad";
// import Propaganda from "@/components/Propaganda";

// function Home() {
//   return (
//     <div
//       className="home-section min-h-screen flex flex-col items-center justify-center
//                     bg-gradient-to-br from-[var(--color-base)] to-[var(--color-surface)]
//                     dark:from-[var(--color-base)] dark:to-[var(--color-surface)]
//                     text-[var(--color-text)] transition-colors duration-300"
//     >
//       <Propaganda />
//       <ConoceCandidatos />
//       <ControlVotaciones />
//       <Caracteristicas />
//       <Encuesta />
//       <Actividad />
//     </div>
//   );
// }

// export default Home;

/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: home/index.jsx
 * UBICACIÓN: /frontend/src/pages/home/index.jsx
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Orden de secciones:
 *  1. Hero              — foto + overlay + mockup + CTA
 *  2. Timeline          — 4 pasos del proceso electoral
 *  3. Propaganda        — banners scrolling + info electoral con imágenes
 *  4. ConoceCandidatos  — grid de tarjetas con avatar/foto
 *  5. ControlVotaciones — stats + globo animado + imagen seguridad
 *  6. Caracteristicas   — 4 features con imagen + ícono
 *  7. Encuesta          — encuesta de satisfacción
 *  8. Actividad         — banda global con fondo foto + count-up
 */

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
