/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: Timeline.jsx
 * UBICACIÓN: /frontend/src/components/home/Timeline.jsx
 * DESCRIPCIÓN: Los 4 pasos del proceso electoral — reemplaza los
 *              banners de texto como introducción visual al flujo
 * ═══════════════════════════════════════════════════════════════════════
 */

import { FileText, Users, Vote, BarChart3 } from "lucide-react";

const STEPS = [
  {
    num: 1,
    label: "Regístrate",
    desc: "Crea tu cuenta con tu documento de identidad",
    Icon: FileText,
    color: "#185FA5",
    bg: "#E6F1FB",
    /*
      🖼️ IMAGEN 3 — Paso 1: Registro
      Unsplash query: "person registering online form laptop"
      Ruta: /src/assets/images/step-registro.jpg
    */
    img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=60",
    imgAlt: "Registro en línea",
  },
  {
    num: 2,
    label: "Conoce candidatos",
    desc: "Explora propuestas y perfiles de cada candidato",
    Icon: Users,
    color: "#0F6E56",
    bg: "#E1F5EE",
    /*
      🖼️ IMAGEN 4 — Paso 2: Candidatos
      Unsplash query: "group people meeting discussion"
      Ruta: /src/assets/images/step-candidatos.jpg
    */
    img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=60",
    imgAlt: "Candidatos y propuestas",
  },
  {
    num: 3,
    label: "Vota",
    desc: "Emite tu voto de forma segura y privada",
    Icon: Vote,
    color: "#854F0B",
    bg: "#FAEEDA",
    /*
      🖼️ IMAGEN 5 — Paso 3: Voto
      Unsplash query: "hand ballot voting box democracy"
      Ruta: /src/assets/images/step-voto.jpg
    */
    img: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=400&q=60",
    imgAlt: "Depositar voto en urna",
  },
  {
    num: 4,
    label: "Ver resultados",
    desc: "Consulta los resultados en tiempo real",
    Icon: BarChart3,
    color: "#3C3489",
    bg: "#EEEDFE",
    /*
      🖼️ IMAGEN 6 — Paso 4: Resultados
      Unsplash query: "data charts analytics dashboard screen"
      Ruta: /src/assets/images/step-resultados.jpg
    */
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=60",
    imgAlt: "Dashboard de resultados",
  },
];

function Timeline() {
  return (
    <section
      className="w-full py-20 px-4"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="max-w-5xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-14" data-aos="fade-up">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            El proceso electoral
          </p>
          <h2
            className="text-3xl md:text-4xl font-extrabold"
            style={{ color: "var(--color-text)", fontFamily: "var(--font-heading)" }}
          >
            Votar es fácil en{" "}
            <span style={{ color: "var(--color-primary)" }}>4 pasos</span>
          </h2>
        </div>

        {/* Grid de pasos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.Icon;
            return (
              <div
                key={step.num}
                className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                {/* Imagen del paso */}
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={step.img}
                    alt={step.imgAlt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ filter: "brightness(0.7)" }}
                  />
                  {/* Número de paso sobre la imagen */}
                  <div
                    className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: step.color }}
                  >
                    {step.num}
                  </div>
                  {/* Ícono centrado */}
                  <div
                    className="absolute bottom-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ background: step.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                </div>

                {/* Texto */}
                <div className="p-4">
                  <h3
                    className="font-bold mb-1"
                    style={{ color: "var(--color-text)", fontFamily: "var(--font-heading)" }}
                  >
                    {step.label}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Línea conectora decorativa — solo desktop */}
        <div className="hidden lg:flex items-center justify-center mt-8 gap-0">
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: step.color }}
              />
              {i < STEPS.length - 1 && (
                <div
                  className="h-0.5 w-24 timeline-connector"
                  style={{ background: `linear-gradient(to right, ${step.color}, ${STEPS[i+1].color})` }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes grow-connector { from{width:0} to{width:6rem} }
        .timeline-connector { animation: grow-connector 1s ease both; }
      `}</style>
    </section>
  );
}

export default Timeline;