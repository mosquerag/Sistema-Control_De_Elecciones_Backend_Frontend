import { useState, useEffect } from "react";
import { ShieldCheck, Zap, TrendingUp, Users, Vote, Award } from "lucide-react";

import ilustracion1 from "@/ilustraciones/01.svg";
import ilustracion2 from "@/ilustraciones/02.svg";
import ilustracion3 from "@/ilustraciones/03.svg";
import ilustracion4 from "@/ilustraciones/04.svg";
import ilustracion5 from "@/ilustraciones/05.svg";
import ilustracion6 from "@/ilustraciones/06.svg";
import ilustracion7 from "@/ilustraciones/07.svg";
import ilustracion8 from "@/ilustraciones/08.svg";
import ilustracion9 from "@/ilustraciones/09.svg";
import ilustracion10 from "@/ilustraciones/10.svg";
import ilustracion12 from "@/ilustraciones/12.svg";

const BG_IMAGES = [
  ilustracion1,
  ilustracion2,
  ilustracion3,
  ilustracion4,
  ilustracion5,
  ilustracion6,
  ilustracion7,
  ilustracion8,
  ilustracion9,
  ilustracion10,
  ilustracion12,
];

const SLIDE_INTERVAL = 4500;

const STATS = [
  {
    label: "Votos emitidos",
    target: 38420,
    suffix: "",
    icon: Vote,
    color: "text-blue-400 dark:text-blue-300",
  },
  {
    label: "Ciudadanos activos",
    target: 26800,
    suffix: "",
    icon: Users,
    color: "text-emerald-400 dark:text-emerald-300",
  },
  {
    label: "Participación",
    target: 73,
    suffix: "%",
    icon: TrendingUp,
    color: "text-amber-400 dark:text-amber-300",
  },
  {
    label: "Candidatos",
    target: 19,
    suffix: "",
    icon: Award,
    color: "text-purple-400 dark:text-purple-300",
  },
];

const CANDIDATES = [
  {
    name: "A. Martínez",
    party: "PDR",
    pct: 38,
    color: "bg-blue-500 dark:bg-blue-400",
  },
  {
    name: "L. Medina",
    party: "JAN",
    pct: 29,
    color: "bg-emerald-500 dark:bg-green-400",
  },
  {
    name: "T. Mbeki",
    party: "MJS",
    pct: 21,
    color: "bg-amber-500 dark:bg-amber-400",
  },
  {
    name: "Otros",
    party: "—",
    pct: 12,
    color: "bg-slate-500 dark:bg-slate-400",
  },
];

/* ── Hooks ── */
function useCountUp(target, duration = 1800, started = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, started]);
  return val;
}

/* ── Sub-components ── */
function StatCard({ stat, started }) {
  const val = useCountUp(stat.target, 1800, started);
  const Icon = stat.icon;
  return (
    // <div className="flex flex-col items-center
    //   bg-white/12 dark:bg-white/8
    //   backdrop-blur-sm
    //   border border-white/15 dark:border-white/10
    //   rounded-2xl px-3 py-4
    //   hover:bg-white/20 dark:hover:bg-white/12
    //   transition-all duration-300 hover:-translate-y-1"
    // >
    <div
      className="flex flex-col items-center
      bg-blue-600/40 dark:bg-blue-700/30
      backdrop-blur-sm
      border border-blue-400/25 dark:border-blue-300/30
      rounded-2xl px-3 py-4
      hover:bg-blue-500/40 dark:hover:bg-blue-400
      transition-all duration-300 hover:-translate-y-1"
    >
      <Icon className={`w-5 h-5 mb-1.5 ${stat.color}`} />
      <span className="text-xl lg:text-2xl font-extrabold text-white tabular-nums">
        {val.toLocaleString()}
        {stat.suffix}
      </span>
      <span className="text-xs text-white/50 dark:text-white/40 text-center mt-0.5">
        {stat.label}
      </span>
    </div>
  );
}

function VoteChart({ started }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    if (started) setTimeout(() => setAnimated(true), 300);
  }, [started]);

  return (
    // <div
    //   className="
    //   bg-white/12 dark:bg-white/8
    //   backdrop-blur-md
    //   border border-white/15 dark:border-white/10
    //   rounded-2xl p-5"
    // >
    <div
      className="backdrop-blur-md rounded-2xl p-5
      bg-blue-700/20 dark:bg-blue-600/30
      border border-blue-400/15 dark:border-blue-300/30"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-white  font-semibold text-sm">
          Resultados en vivo
        </span>
        <span className="flex items-center gap-1.5 text-xs text-green-300 ">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 dark:bg-green-300 animate-pulse" />
          En tiempo real
        </span>
      </div>
      <div className="space-y-3">
        {CANDIDATES.map((c) => (
          <div key={c.name}>
            <div className="flex justify-between text-xs text-white/70 dark:text-white/60 mb-1">
              <span className="font-medium text-white dark:text-white/90">
                {c.name} <span className="text-white ">· {c.party}</span>
              </span>
              <span className="text-white ">{c.pct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10 dark:bg-white/8 overflow-hidden">
              <div
                className={`h-full rounded-full ${c.color} transition-all duration-1000 ease-out`}
                style={{ width: animated ? `${c.pct}%` : "0%" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityFeed() {
  const EVENTS = [
    { text: "Nuevo voto registrado", region: "Bogotá", time: "hace 2s" },
    { text: "Mesa habilitada", region: "Medellín", time: "hace 5s" },
    { text: "Voto verificado", region: "Cali", time: "hace 9s" },
    { text: "Nuevo voto registrado", region: "Barranquilla", time: "hace 12s" },
  ];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setActive((p) => (p + 1) % EVENTS.length),
      2000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    // <div
    //   className="
    //   bg-white/12 dark:bg-white/8
    //   backdrop-blur-md
    //   border border-white/15 dark:border-white/10
    //   rounded-2xl p-5"
    // >

    <div
      className="
      bg-white/12 dark:bg-white/8
      backdrop-blur-md
      bg-blue-700/20 dark:bg-blue-600/30
      border border-blue-400/15 dark:border-blue-300/30
      rounded-2xl p-5"
    >
      <p className="text-white text-xs uppercase tracking-widest mb-3 font-semibold">
        Actividad reciente
      </p>
      <div className="space-y-2.5">
        {EVENTS.map((e, i) => (
          <div
            key={i}
            // className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-500 ${
            //   i === active
            //     ? "bg-blue-500/20 dark:bg-blue-400/15 border border-blue-400/20 dark:border-blue-300/20"
            //     : "opacity-40 dark:opacity-30"
            // }`}

            className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-500 ${
              i === active
                ? "bg-blue-700/60 dark:bg-blue-600/40 border border-blue-400/20 dark:border-blue-300/20"
                : "opacity-40 dark:opacity-30"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                i === active
                  ? "bg-blue-400 dark:bg-blue-300 animate-pulse"
                  : "bg-white/20 dark:bg-white/15"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-white  text-xs font-medium truncate">
                {e.text}
              </p>
              <p className="text-white text-xs">{e.region}</p>
            </div>
            <span className="text-white text-xs shrink-0">{e.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Hero principal ── */
export default function Hero() {
  const [bgIndex, setBgIndex] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setInterval(
      () => setBgIndex((i) => (i + 1) % BG_IMAGES.length),
      SLIDE_INTERVAL,
    );
    return () => clearInterval(t);
  }, []);

  const goTo = (n) => setBgIndex((n + BG_IMAGES.length) % BG_IMAGES.length);

  return (
    <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden bg-slate-100/10 dark:bg-slate-900/50">
      {/* ── Fondo: imágenes apiladas con fade ── */}
      {BG_IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-contain"
          style={{
            opacity: i === bgIndex ? 1 : 0,
            transition: "opacity 1.4s ease",
            filter: "brightness(0.58) contrast(1.1) sepia(0.3)",
          }}
        />
      ))}

      {/* ── Overlay gradiente PARA EL DIV DONDE EST ALAS IMAGEN  ── */}
      {/* <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-blue-950/30 to-slate-900/15 dark:from-slate-950/75 dark:via-blue-950/35 dark:to-slate-950/20" /> */}
      <div className="absolute inset-0 bg-gradient-to-l from-slate-900/70 via-blue-950/30 to-slate-900/15 dark:from-slate-950/75 dark:via-blue-950/35 dark:to-slate-950/20" />

      {/* ── Partículas decorativas ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-blue-400/40 dark:bg-blue-300/30 animate-bounce"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* ── Contenido ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-16 lg:py-24">
        {/* Columna izquierda */}
        <div className="flex flex-col">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6
            bg-blue-800 dark:bg-blue-900/80
            text-gray-200 dark:text-white
            backdrop-blur-md
            border border-blue-400 dark:border-blue-400
            w-fit"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 dark:bg-green-300 animate-pulse" />
            Elecciones 2025 — Sistema activo
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-white dark:text-white/95">
            Tu voz importa.
            <br />
            <span className="text-blue-400 dark:text-blue-300">
              Vota seguro.
            </span>
          </h1>

          <p className="text-base lg:text-lg mb-8 max-w-lg text-white dark:text-white/65 leading-relaxed">
            La plataforma más confiable para gestionar elecciones nacionales e
            internacionales con resultados en tiempo real y máxima seguridad
            garantizada.
          </p>

          <div className="flex flex-wrap gap-5 mb-8">
            {[
              { icon: ShieldCheck, text: "Encriptación E2E" },
              { icon: Zap, text: "Resultados en tiempo real" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 text-slate-200 dark:text-white text-sm font-medium"
              >
                <Icon className="w-4 h-4 text-blue-400 dark:text-blue-300" />
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATS.map((s) => (
              <StatCard key={s.label} stat={s} started={started} />
            ))}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-4">
          <VoteChart started={started} />
          <ActivityFeed />
        </div>
      </div>

      {/* ── Puntos indicadores del carrusel ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {BG_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-400 ${
              i === bgIndex
                ? "w-5 h-2 bg-blue-400 dark:bg-blue-300"
                : "w-2 h-2 bg-white/30 dark:bg-white/20 hover:bg-white/50 dark:hover:bg-white/35"
            }`}
          />
        ))}
      </div>

      {/* ── Botones anterior / siguiente ── */}
      {/* <button
        onClick={() => goTo(bgIndex - 1)}
        aria-label="Imagen anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full
          bg-white/10 dark:bg-white/8
          border border-white/15 dark:border-white/10
          text-white dark:text-white/80
          flex items-center justify-center
          hover:bg-white/20 dark:hover:bg-white/15
          transition-all backdrop-blur-sm"
      >
        ‹
      </button>
      <button
        onClick={() => goTo(bgIndex + 1)}
        aria-label="Imagen siguiente"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full
          bg-white/10 dark:bg-white/8
          border border-white/15 dark:border-white/10
          text-white dark:text-white/80
          flex items-center justify-center
          hover:bg-white/20 dark:hover:bg-white/15
          transition-all backdrop-blur-sm"
      >
        ›
      </button> */}

      {/* ── Scroll hint (solo desktop) ── */}
      <div className="hidden md:block absolute bottom-8 right-10 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 dark:border-white/20 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-white/50 dark:bg-white/35" />
        </div>
      </div>
    </section>
  );
}
