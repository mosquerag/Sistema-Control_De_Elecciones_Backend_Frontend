/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: Home.jsx
 * UBICACIÓN: /frontend/src/pages/home/Home.jsx
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Todo el contenido de la home en un solo archivo.
 * Header y Footer se mantienen independientes (no se tocan aquí).
 *
 * SECCIONES:
 *  1. Hero             — foto de fondo + overlay + mockup flotante + CTA
 *  2. Timeline         — 4 pasos del proceso electoral (reemplaza banners)
 *  3. Propaganda       — banners scrolling (se conservan debajo del timeline)
 *  4. InfoElectoral    — tarjetas Requisitos / Proceso / Importante con imagen
 *  5. ConoceCandidatos — grid de tarjetas con avatar + color de partido
 *  6. ControlVotaciones— stats + globo SVG animado
 *  7. Caracteristicas  — 4 features con micro-ilustración animada al hover
 *  8. Encuesta         — encuesta de satisfacción
 *  9. Actividad        — banda 150+ / 10M+ / 99.9% con iconos animados
 *
 * DEPENDENCIAS EXTERNAS (instalar si no están):
 *   npm install aos gsap @studio-freight/lenis
 *
 * IMÁGENES:
 *   Cada sección tiene un comentario "🖼️ REEMPLAZAR IMAGEN" con la
 *   ruta sugerida y el query de búsqueda en Unsplash/Pexels.
 * ═══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from "react";
import {
  Vote,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  Users,
  Shield,
  BarChart3,
  Globe,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getPublicStats } from "@/api/public";
import { enviarEncuesta } from "@/api/encuestas";
import { toastError } from "@/utils/alertas";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import "../index.css"; // Asegúrate de que Tailwind y tus estilos personalizados estén importados

/* ─────────────────────────────────────────────
   DATOS ESTÁTICOS
───────────────────────────────────────────── */
const SCROLL_MESSAGES = [
  { icon: Vote, text: "🗳️ TU VOTO ES TU VOZ - Ejerce tu derecho democrático" },
  {
    icon: Calendar,
    text: "📅 FECHA DE VOTACIÓN: Verifica tu fecha electoral local",
  },
  {
    icon: FileText,
    text: "📋 REQUISITOS: Documento de identidad válido y registro electoral",
  },
  {
    icon: CheckCircle,
    text: "✅ VOTA INFORMADO: Conoce las propuestas de cada candidato",
  },
  {
    icon: AlertCircle,
    text: "⚠️ EVITA MULTAS: Votar es obligatorio en muchas jurisdicciones",
  },
  {
    icon: Users,
    text: "👥 PARTICIPA: La democracia necesita tu participación activa",
  },
];

const TIMELINE_STEPS = [
  { num: 1, label: "Regístrate", icon: FileText },
  { num: 2, label: "Conoce candidatos", icon: Users },
  { num: 3, label: "Vota", icon: Vote },
  { num: 4, label: "Resultados", icon: BarChart3 },
];

const CANDIDATOS_DEMO = [
  {
    initials: "CA",
    name: "Carlos A. López",
    party: "Mov. Nacional",
    color: "#185FA5",
    bg: "#E6F1FB",
    propuestas: 4,
  },
  {
    initials: "MR",
    name: "María Rodríguez",
    party: "Alianza Verde",
    color: "#3B6D11",
    bg: "#EAF3DE",
    propuestas: 6,
  },
  {
    initials: "JP",
    name: "Juan P. Martínez",
    party: "Partido Futuro",
    color: "#854F0B",
    bg: "#FAEEDA",
    propuestas: 5,
  },
  {
    initials: "AL",
    name: "Ana L. Torres",
    party: "Unidad Cívica",
    color: "#712B13",
    bg: "#FAECE7",
    propuestas: 3,
  },
];

const FEATURES = [
  {
    icon: Shield,
    title: "Seguridad Garantizada",
    desc: "Encriptación de extremo a extremo y verificación de identidad para máxima seguridad.",
    color: "#185FA5",
    bg: "#E6F1FB",
    animClass: "feature-lock",
  },
  {
    icon: BarChart3,
    title: "Resultados en Tiempo Real",
    desc: "Visualiza estadísticas y resultados actualizados instantáneamente.",
    color: "#3B6D11",
    bg: "#EAF3DE",
    animClass: "feature-bars",
  },
  {
    icon: Globe,
    title: "Alcance Global",
    desc: "Gestiona votaciones nacionales e internacionales desde una sola plataforma.",
    color: "#0F6E56",
    bg: "#E1F5EE",
    animClass: "feature-globe",
  },
  {
    icon: Users,
    title: "Multiusuario",
    desc: "Sistema robusto para administradores, supervisores y votantes.",
    color: "#3C3489",
    bg: "#EEEDFE",
    animClass: "feature-users",
  },
];

const ENCUESTA_OPCIONES = [
  "Muy satisfecho con el sistema actual",
  "Satisfecho, pero necesita mejoras",
  "Neutral",
  "Insatisfecho con algunas características",
];

/* ─────────────────────────────────────────────
   HOOK: count-up animado al entrar en viewport
───────────────────────────────────────────── */
function useCountUp(target, duration = 1800) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(ease * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return [value, ref];
}

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════════════════ */
function Home() {
  /* AOS init */
  useEffect(() => {
    AOS.init({ duration: 700, once: true, offset: 60 });
  }, []);

  return (
    <div className="home-section min-h-screen flex flex-col bg-[var(--color-base)] text-[var(--color-text)] transition-colors duration-300">
      <SectionHero />
      <SectionTimeline />
      <SectionPropaganda />
      <SectionInfoElectoral />
      <SectionCandidatos />
      <SectionControlVotaciones />
      <SectionCaracteristicas />
      <SectionEncuesta />
      <SectionActividad />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   1. HERO
═══════════════════════════════════════════════════════════════════════ */
function SectionHero() {
  return (
    <section className="relative w-full min-h-[88vh] flex items-center overflow-hidden">
      {/*
        🖼️ REEMPLAZAR IMAGEN — Foto de fondo hero
        Ruta sugerida: /src/assets/images/hero-voting.jpg
        Unsplash query: "voting booth citizens democracy"
        Pexels query:   "votación democracia urna"
        Descárgala y reemplaza el src abajo:
      */}
      <img
        src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1400&q=75"
        alt="Ciudadanos ejerciendo el derecho al voto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.38)" }}
      />

      {/* Overlay gradiente */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(120deg, rgba(20,45,80,0.85) 0%, rgba(10,57,114,0.7) 60%, rgba(20,45,80,0.4) 100%)",
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
        {/* Texto */}
        <div className="animate-fadeInLeft">
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-5"
            style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Elecciones 2025 — Sistema activo
          </span>

          <h1
            className="text-5xl md:text-6xl font-extrabold leading-tight mb-6"
            style={{ color: "white", fontFamily: "var(--font-heading)" }}
          >
            Tu voz importa.
            <br />
            <span style={{ color: "#60a5fa" }}>Vota seguro.</span>
          </h1>

          <p
            className="text-lg mb-8"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            La plataforma más confiable para gestionar elecciones nacionales e
            internacionales con resultados en tiempo real y máxima seguridad.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              className="btn-primary flex items-center gap-2 px-7 py-3 text-base rounded-xl"
              style={{ background: "#2563eb" }}
            >
              Votar ahora <ChevronRight className="w-4 h-4" />
            </button>
            <button
              className="btn-secondary flex items-center gap-2 px-7 py-3 text-base rounded-xl"
              style={{
                border: "2px solid rgba(255,255,255,0.5)",
                color: "white",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              Registrarme
            </button>
          </div>
        </div>

        {/* Mockup flotante */}
        <div className="hidden lg:flex justify-center animate-fadeInRight">
          <div className="animate-floating">
            {/*
              🖼️ REEMPLAZAR IMAGEN — Mockup de la app en móvil
              Opción A: Usar una captura de pantalla real de tu app
              Ruta: /src/assets/images/app-mockup.png
              Opción B: Dejar el SVG de abajo como placeholder
            */}
            <PhoneMockupSVG />
          </div>
        </div>
      </div>
    </section>
  );
}

/* SVG placeholder del mockup — reemplazar con <img> cuando tengas la captura */
function PhoneMockupSVG() {
  return (
    <svg width="200" height="380" viewBox="0 0 200 380" fill="none">
      {/* Marco */}
      <rect
        x="4"
        y="4"
        width="192"
        height="372"
        rx="28"
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2"
      />
      {/* Pantalla */}
      <rect
        x="12"
        y="22"
        width="176"
        height="336"
        rx="18"
        fill="rgba(20,45,80,0.9)"
      />
      {/* Notch */}
      <rect
        x="70"
        y="4"
        width="60"
        height="12"
        rx="6"
        fill="rgba(255,255,255,0.15)"
      />
      {/* Header app */}
      <rect
        x="20"
        y="34"
        width="160"
        height="36"
        rx="8"
        fill="rgba(37,99,235,0.6)"
      />
      <text
        x="100"
        y="57"
        textAnchor="middle"
        fontSize="12"
        fill="white"
        fontFamily="sans-serif"
        fontWeight="600"
      >
        VoteSecure
      </text>
      {/* Stat rows */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x="20"
            y={88 + i * 52}
            width="160"
            height="40"
            rx="8"
            fill="rgba(255,255,255,0.07)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.5"
          />
          <rect
            x="30"
            y={100 + i * 52}
            width="60"
            height="8"
            rx="3"
            fill="rgba(96,165,250,0.5)"
          />
          <rect
            x="30"
            y={112 + i * 52}
            width="40"
            height="6"
            rx="3"
            fill="rgba(255,255,255,0.2)"
          />
          <rect
            x="154"
            y={98 + i * 52}
            width="18"
            height="18"
            rx="5"
            fill="rgba(37,99,235,0.6)"
          />
        </g>
      ))}
      {/* Barra participación */}
      <rect
        x="20"
        y="254"
        width="160"
        height="60"
        rx="8"
        fill="rgba(255,255,255,0.07)"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.5"
      />
      <text
        x="30"
        y="272"
        fontSize="9"
        fill="rgba(255,255,255,0.5)"
        fontFamily="sans-serif"
      >
        Nivel de Participación
      </text>
      <text
        x="30"
        y="294"
        fontSize="18"
        fill="white"
        fontFamily="sans-serif"
        fontWeight="700"
      >
        50%
      </text>
      <rect
        x="30"
        y="304"
        width="140"
        height="4"
        rx="2"
        fill="rgba(255,255,255,0.15)"
      />
      <rect x="30" y="304" width="70" height="4" rx="2" fill="#3b82f6" />
      {/* Botón votar */}
      <rect x="30" y="328" width="140" height="22" rx="8" fill="#2563eb" />
      <text
        x="100"
        y="343"
        textAnchor="middle"
        fontSize="10"
        fill="white"
        fontFamily="sans-serif"
        fontWeight="600"
      >
        Votar →
      </text>
      {/* Home bar */}
      <rect
        x="70"
        y="370"
        width="60"
        height="3"
        rx="2"
        fill="rgba(255,255,255,0.25)"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   2. TIMELINE — 4 pasos
═══════════════════════════════════════════════════════════════════════ */
function SectionTimeline() {
  return (
    <section
      className="w-full py-14 px-4"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="max-w-4xl mx-auto">
        <p
          className="text-center text-sm font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          El proceso electoral
        </p>
        <h2
          className="text-center text-3xl font-bold mb-10"
          style={{
            color: "var(--color-text)",
            fontFamily: "var(--font-heading)",
          }}
        >
          Votar es fácil en 4 pasos
        </h2>

        <div className="relative flex items-start justify-between gap-4">
          {/* Línea conectora */}
          <div
            className="absolute top-8 left-[10%] right-[10%] h-0.5 hidden md:block"
            style={{ background: "var(--color-border)" }}
          />
          <div
            className="absolute top-8 left-[10%] w-[55%] h-0.5 hidden md:block timeline-line-animated"
            style={{ background: "var(--color-primary)" }}
          />

          {TIMELINE_STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = i < 3;
            return (
              <div
                key={step.num}
                className="flex flex-col items-center flex-1 z-10"
                data-aos="fade-up"
                data-aos-delay={i * 120}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 hover:scale-110"
                  style={{
                    background: done
                      ? "var(--color-primary)"
                      : "var(--color-surface)",
                    border: `2px solid ${done ? "var(--color-primary)" : "var(--color-border)"}`,
                    boxShadow: done
                      ? "0 4px 16px rgba(49,78,110,0.25)"
                      : "none",
                  }}
                >
                  <Icon
                    className="w-7 h-7"
                    style={{
                      color: done ? "white" : "var(--color-text-muted)",
                    }}
                  />
                </div>
                <span
                  className="text-sm font-semibold text-center"
                  style={{
                    color: done
                      ? "var(--color-text)"
                      : "var(--color-text-muted)",
                  }}
                >
                  {step.label}
                </span>
                <span
                  className="text-xs mt-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Paso {step.num}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes grow-line { from { width: 0 } to { width: 55% } }
        .timeline-line-animated { animation: grow-line 1.4s ease .3s both; }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   3. PROPAGANDA — banners scrolling
═══════════════════════════════════════════════════════════════════════ */
function SectionPropaganda() {
  const [isPaused, setIsPaused] = useState(false);
  const msgs = SCROLL_MESSAGES;

  return (
    <section className="w-full space-y-4 py-6 px-4 bg-black/5">
      {/* Banner 1 */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-xl"
        style={{
          background:
            "linear-gradient(90deg, var(--color-primary), var(--color-secondary))",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative h-16 flex items-center overflow-hidden">
          <div
            className={`flex absolute whitespace-nowrap ${isPaused ? "" : "animate-scroll-fw"}`}
          >
            {[...msgs, ...msgs].map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="inline-flex items-center mx-8">
                  <Icon className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                  <span className="text-white font-semibold">{m.text}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div
          className="absolute inset-y-0 left-0 w-24 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to right, var(--color-primary), transparent)",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-24 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to left, var(--color-secondary), transparent)",
          }}
        />
      </div>

      {/* Banner 2 (inverso) */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-xl"
        style={{
          background:
            "linear-gradient(90deg, var(--color-secondary), var(--color-accent))",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative h-16 flex items-center overflow-hidden">
          <div
            className={`flex absolute whitespace-nowrap ${isPaused ? "" : "animate-scroll-bw"}`}
          >
            {[...[...msgs].reverse(), ...[...msgs].reverse()].map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="inline-flex items-center mx-8">
                  <Icon className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                  <span className="text-white font-semibold">{m.text}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div
          className="absolute inset-y-0 left-0 w-24 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to right, var(--color-secondary), transparent)",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-24 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to left, var(--color-accent), transparent)",
          }}
        />
      </div>

      <p
        className="text-center text-xs"
        style={{ color: "var(--color-text-muted)" }}
      >
        💡 Pasa el cursor sobre los banners para pausar la animación
      </p>

      <style>{`
        @keyframes scroll-fw { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes scroll-bw { 0% { transform: translateX(-50%) } 100% { transform: translateX(0) } }
        .animate-scroll-fw { animation: scroll-fw 40s linear infinite; }
        .animate-scroll-bw { animation: scroll-bw 40s linear infinite; }
      `}</style>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   4. INFORMACIÓN ELECTORAL 2025
═══════════════════════════════════════════════════════════════════════ */
function SectionInfoElectoral() {
  const cards = [
    {
      title: "Requisitos",
      Icon: FileText,
      accentColor: "#185FA5",
      accentBg: "#E6F1FB",
      items: [
        "Documento de identidad vigente",
        "Estar registrado en el padrón",
        "Conocer tu mesa de votación",
        "Ser mayor de edad",
      ],
      /*
        🖼️ REEMPLAZAR IMAGEN — Tarjeta Requisitos
        Ruta: /src/assets/images/requisitos.jpg
        Unsplash query: "identity document hand close-up"
        Dimensiones recomendadas: 600×200px
      */
      imgSrc:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=60",
      imgAlt: "Documento de identidad",
    },
    {
      title: "Proceso",
      Icon: CheckCircle,
      accentColor: "#0F6E56",
      accentBg: "#E1F5EE",
      items: [
        "Presenta tu documento",
        "Recibe tu tarjeta electoral",
        "Marca tu voto en secreto",
        "Deposita en la urna",
      ],
      /*
        🖼️ REEMPLAZAR IMAGEN — Tarjeta Proceso
        Ruta: /src/assets/images/proceso.jpg
        Unsplash query: "person ballot box voting"
        Dimensiones recomendadas: 600×200px
      */
      imgSrc:
        "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=600&q=60",
      imgAlt: "Persona depositando su voto",
    },
    {
      title: "Importante",
      Icon: AlertCircle,
      accentColor: "#854F0B",
      accentBg: "#FAEEDA",
      items: [
        "El voto es obligatorio",
        "Es personal e intransferible",
        "Prohibido tomar fotos del voto",
        "Respeta el horario establecido",
      ],
      /*
        🖼️ REEMPLAZAR IMAGEN — Tarjeta Importante
        Ruta: /src/assets/images/importante.jpg
        Unsplash query: "law justice gavel scales"
        Dimensiones recomendadas: 600×200px
      */
      imgSrc:
        "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=600&q=60",
      imgAlt: "Símbolo de justicia electoral",
    },
  ];

  return (
    <section
      className="w-full py-16 px-4"
      style={{ background: "var(--color-base)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold mb-3"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-heading)",
            }}
          >
            🗳️ Información Electoral 2025
          </h2>
          <p
            className="text-lg"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Conoce tus derechos y deberes como ciudadano
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => {
            const Icon = card.Icon;
            return (
              <div
                key={card.title}
                className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                {/* Imagen de cabecera */}
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={card.imgSrc}
                    alt={card.imgAlt}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    style={{ filter: "brightness(0.75)" }}
                  />
                  {/* Ícono sobre la imagen */}
                  <div
                    className="absolute bottom-3 left-4 w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: card.accentBg }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: card.accentColor }}
                    />
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-5">
                  <h3
                    className="text-lg font-bold mb-3"
                    style={{
                      color: "var(--color-text)",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {card.title}
                  </h3>
                  <ul className="space-y-2">
                    {card.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        <span
                          className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: card.accentColor }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   5. CANDIDATOS — grid de tarjetas
═══════════════════════════════════════════════════════════════════════ */
function SectionCandidatos() {
  return (
    <section
      className="w-full py-16 px-4"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10" data-aos="fade-up">
          <h2
            className="text-3xl font-bold mb-2"
            style={{
              color: "var(--color-text)",
              fontFamily: "var(--font-heading)",
            }}
          >
            Conoce a los Candidatos
          </h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            {CANDIDATOS_DEMO.length} candidatos registrados — haz clic para ver
            sus propuestas
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {CANDIDATOS_DEMO.map((c, i) => (
            <div
              key={c.name}
              className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 group"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-sm)",
              }}
              data-aos="fade-up"
              data-aos-delay={i * 80}
            >
              {/* Cabecera color partido */}
              <div
                className="h-16 flex items-end justify-center pb-0 relative"
                style={{ background: c.color }}
              >
                {/*
                  🖼️ REEMPLAZAR IMAGEN — Foto del candidato
                  Ruta: /src/assets/images/candidatos/{nombre}.jpg
                  Cuando tengas la foto real, reemplaza el div de iniciales
                  por: <img src={c.foto} alt={c.name} className="w-14 h-14 rounded-full object-cover border-2 border-white absolute -bottom-7 left-1/2 -translate-x-1/2" />
                  y ajusta el padding-top del contenido a pt-10
                */}
                <div
                  className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center font-bold text-sm absolute -bottom-7 left-1/2 -translate-x-1/2"
                  style={{ background: "var(--color-surface)", color: c.color }}
                >
                  {c.initials}
                </div>
              </div>

              {/* Info */}
              <div className="pt-10 pb-4 px-3 text-center">
                <p
                  className="font-semibold text-sm leading-tight mb-1"
                  style={{ color: "var(--color-text)" }}
                >
                  {c.name}
                </p>
                <p
                  className="text-xs mb-3"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {c.party}
                </p>
                <span
                  className="inline-block text-xs font-semibold px-3 py-1 rounded-full transition-all duration-200 group-hover:scale-105"
                  style={{ background: c.bg, color: c.color }}
                >
                  {c.propuestas} propuestas
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   6. CONTROL DE VOTACIONES — stats + globo animado
═══════════════════════════════════════════════════════════════════════ */
function SectionControlVotaciones() {
  const [stats, setStats] = useState({
    totalVotos: 0,
    totalCiudadanos: 0,
    participacion: 0,
    totalCandidatos: 0,
    eleccionesActivas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [votosVal, votosRef] = useCountUp(stats.totalVotos);
  const [ciudVal, ciudRef] = useCountUp(stats.totalCiudadanos);
  const [elecVal, elecRef] = useCountUp(stats.eleccionesActivas);

  useEffect(() => {
    getPublicStats()
      .then((r) => {
        const d = r.data;
        setStats({
          totalVotos: d.totalVotos || 0,
          totalCiudadanos: d.totalCiudadanos || 0,
          participacion: d.participacion || 0,
          totalCandidatos: d.totalCandidatos || 0,
          eleccionesActivas: d.eleccionesActivas || 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stat = (v) => (loading ? "..." : v);

  const statItems = [
    {
      ref: votosRef,
      value: stat(votosVal.toLocaleString()),
      label: "Votos Registrados",
      Icon: BarChart3,
    },
    {
      ref: ciudRef,
      value: stat(ciudVal.toLocaleString()),
      label: "Ciudadanos Registrados",
      Icon: Users,
    },
    {
      ref: elecRef,
      value: stat(elecVal),
      label: "Elecciones Activas",
      Icon: CheckCircle,
    },
  ];

  return (
    <section
      className="w-full py-16 px-4"
      style={{ background: "var(--color-base)" }}
      id="inicio"
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Texto + globo */}
        <div data-aos="fade-right">
          <h2
            className="text-4xl md:text-5xl font-extrabold leading-tight mb-5"
            style={{
              color: "var(--color-text)",
              fontFamily: "var(--font-heading)",
            }}
          >
            Control de Votaciones <br />
            <span style={{ color: "var(--color-primary)" }}>
              Seguro y Transparente
            </span>
          </h2>
          <p
            className="text-lg mb-8"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Gestiona elecciones nacionales e internacionales con la plataforma
            más confiable del mercado. Resultados en tiempo real y máxima
            seguridad garantizada.
          </p>

          {/* Globo SVG con puntos pulsantes */}
          <div className="flex justify-center lg:justify-start">
            <GlobeSVG />
          </div>
        </div>

        {/* Dashboard card */}
        <div data-aos="fade-left">
          <Card className="p-6 w-full hover:scale-100">
            {/* Dots ventana */}
            <div className="flex gap-2 mb-5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
            </div>

            <div className="space-y-3">
              {statItems.map(({ ref, value, label, Icon }) => (
                <div
                  ref={ref}
                  key={label}
                  className="flex justify-between items-center p-4 rounded-xl border-2 hover:translate-x-1 transition-transform duration-300"
                  style={{
                    background: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {value}
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {label}
                    </div>
                  </div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
                    style={{ background: "var(--color-primary)" }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>

            {/* Participación */}
            <Card className="mt-5 p-4">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Nivel de Participación
                </span>
                <TrendingUp
                  className="w-5 h-5"
                  style={{ color: "var(--color-accent)" }}
                />
              </div>
              <div
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--color-text)" }}
              >
                {stat(`${stats.participacion}%`)}
              </div>
              <div
                className="w-full rounded-full h-2 overflow-hidden"
                style={{ background: "var(--color-border)" }}
              >
                <div
                  className="h-2 rounded-full transition-all duration-700 shimmer-bar"
                  style={{
                    width: `${stats.participacion}%`,
                    background: "var(--color-primary)",
                  }}
                />
              </div>
            </Card>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes shimmer-move { 0%{left:-60%} 100%{left:160%} }
        .shimmer-bar { position: relative; overflow: hidden; }
        .shimmer-bar::after {
          content: '';
          position: absolute;
          inset: 0;
          width: 40%;
          background: rgba(255,255,255,0.3);
          animation: shimmer-move 1.8s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

/* Globo SVG animado */
function GlobeSVG() {
  const dots = [
    { cx: 42, cy: 38, delay: "0s" },
    { cx: 78, cy: 28, delay: "0.5s" },
    { cx: 88, cy: 55, delay: "1s" },
    { cx: 55, cy: 68, delay: "0.7s" },
    { cx: 28, cy: 58, delay: "1.3s" },
  ];
  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle
        cx="65"
        cy="65"
        r="52"
        fill="#E6F1FB"
        stroke="#378ADD"
        strokeWidth="1.2"
      />
      <ellipse
        cx="65"
        cy="65"
        rx="26"
        ry="52"
        fill="none"
        stroke="#378ADD"
        strokeWidth="0.8"
        strokeDasharray="4 3"
        style={{
          transformOrigin: "65px 65px",
          animation: "spin-globe 14s linear infinite",
        }}
      />
      <line
        x1="13"
        y1="65"
        x2="117"
        y2="65"
        stroke="#378ADD"
        strokeWidth="0.7"
        opacity="0.5"
      />
      <line
        x1="65"
        y1="13"
        x2="65"
        y2="117"
        stroke="#378ADD"
        strokeWidth="0.7"
        opacity="0.5"
      />
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r="5"
          fill="#E24B4A"
          style={{
            animation: `pulse-dot 1.6s ease-in-out ${d.delay} infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes spin-globe { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse-dot { 0%,100%{r:3;opacity:.8} 50%{r:6;opacity:.2} }
      `}</style>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   7. CARACTERÍSTICAS
═══════════════════════════════════════════════════════════════════════ */
function SectionCaracteristicas() {
  return (
    <section
      id="caracteristicas"
      className="w-full py-16 px-4"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="max-w-5xl mx-auto text-center">
        <h2
          className="text-3xl font-bold mb-3"
          style={{
            color: "var(--color-text)",
            fontFamily: "var(--font-heading)",
          }}
          data-aos="fade-up"
        >
          ¿Por qué elegir VoteSecure?
        </h2>
        <p
          className="mb-12 max-w-2xl mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
          data-aos="fade-up"
          data-aos-delay="80"
        >
          Nuestra plataforma ofrece herramientas avanzadas para garantizar
          procesos electorales seguros y transparentes.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
                data-aos="fade-up"
                data-aos-delay={i * 90}
              >
                {/* Ícono con fondo animado al hover */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: f.bg }}
                >
                  <Icon className="w-7 h-7" style={{ color: f.color }} />
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{
                    color: "var(--color-text)",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   8. ENCUESTA
═══════════════════════════════════════════════════════════════════════ */
function SectionEncuesta() {
  const [selectedOption, setSelectedOption] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVote = async () => {
    if (!selectedOption || loading) return;
    setLoading(true);
    try {
      await enviarEncuesta(
        selectedOption,
        "¿Qué tan satisfecho estás con los sistemas de votación digital actuales?",
      );
      setHasVoted(true);
    } catch {
      toastError("No se pudo registrar tu respuesta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="w-full py-16 px-4"
      style={{ background: "var(--color-base)" }}
    >
      <div
        className="max-w-2xl mx-auto rounded-2xl p-8"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
        data-aos="fade-up"
      >
        {hasVoted ? (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3
              className="text-2xl font-bold mb-2"
              style={{ color: "var(--color-text)" }}
            >
              ¡Gracias por tu respuesta!
            </h3>
            <p
              className="mb-4"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Tu opinión nos ayuda a mejorar continuamente.
            </p>
            <button
              onClick={() => {
                setHasVoted(false);
                setSelectedOption("");
              }}
              className="font-semibold"
              style={{ color: "var(--color-accent)" }}
            >
              Responder nuevamente
            </button>
          </div>
        ) : (
          <>
            <h2
              className="text-3xl font-bold text-center mb-2"
              style={{
                color: "var(--color-text)",
                fontFamily: "var(--font-heading)",
              }}
            >
              Encuesta Rápida
            </h2>
            <p
              className="text-center mb-8"
              style={{ color: "var(--color-text-secondary)" }}
            >
              ¿Qué tan satisfecho estás con los sistemas de votación digital
              actuales?
            </p>
            <div className="space-y-3 mb-6">
              {ENCUESTA_OPCIONES.map((opt) => (
                <label
                  key={opt}
                  className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200"
                  style={{
                    borderColor:
                      selectedOption === opt
                        ? "var(--color-accent)"
                        : "var(--color-border)",
                    background:
                      selectedOption === opt
                        ? "var(--color-background-info, #E6F1FB)"
                        : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="encuesta"
                    value={opt}
                    checked={selectedOption === opt}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-4 h-4"
                    style={{ accentColor: "var(--color-accent)" }}
                  />
                  <span
                    className="ml-3 text-sm"
                    style={{ color: "var(--color-text)" }}
                  >
                    {opt}
                  </span>
                </label>
              ))}
            </div>
            <Button
              onClick={handleVote}
              disabled={!selectedOption || loading}
              className="w-full py-3 rounded-xl font-semibold"
              variant="primary"
            >
              {loading ? "Enviando..." : "Enviar Respuesta"}
            </Button>
          </>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   9. ACTIVIDAD — banda de estadísticas
═══════════════════════════════════════════════════════════════════════ */
function SectionActividad() {
  const actStats = [
    { icon: Globe, suffix: "+", target: 150, label: "Países Activos" },
    { icon: Vote, suffix: "M+", target: 10, label: "Votos Registrados" },
    { icon: Shield, suffix: "%", target: 99, label: "Tiempo de Actividad" },
  ];

  return (
    <section
      id="actividad"
      className="w-full py-16 px-4"
      style={{ background: "var(--color-primary)" }}
    >
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
        {actStats.map((s, i) => {
          const Icon = s.icon;
          const [val, ref] = useCountUp(s.target); // eslint-disable-line react-hooks/rules-of-hooks
          return (
            <div
              key={s.label}
              ref={ref}
              className="flex flex-col items-center"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>
              <p className="text-5xl font-bold mb-2 text-white">
                {val}
                {s.suffix}
              </p>
              <p style={{ color: "rgba(255,255,255,0.75)" }}>{s.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Home;
