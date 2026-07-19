import { useState, useEffect, useRef } from "react";
import {
  Vote,
  FileText,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

const INFO_CARDS = [
  {
    title: "Requisitos",
    Icon: FileText,
    colorClass: "bg-blue-700",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    dotColor: "bg-blue-300",
    items: [
      "Documento de identidad vigente",
      "Estar registrado en el padrón electoral",
      "Conocer tu mesa y puesto de votación",
      "Ser mayor de 18 años",
    ],
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=65",
    imgAlt: "Documento de identidad",
  },
  {
    title: "Proceso",
    Icon: CheckCircle,
    colorClass: "bg-emerald-700",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    dotColor: "bg-emerald-300",
    items: [
      "Presenta tu documento en la mesa",
      "Recibe tu tarjeta electoral oficial",
      "Marca tu voto en el cubículo privado",
      "Deposita el sobre en la urna sellada",
    ],
    img: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=600&q=65",
    imgAlt: "Proceso de votación",
  },
  {
    title: "Importante",
    Icon: AlertCircle,
    colorClass: "bg-amber-700",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
    dotColor: "bg-amber-300",
    items: [
      "El voto es secreto y obligatorio",
      "Es personal e intransferible",
      "Prohibido fotografiar la tarjeta",
      "Llega antes del cierre de mesas",
    ],
    img: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=600&q=65",
    imgAlt: "Justicia electoral",
  },
  {
    title: "Seguridad",
    Icon: ShieldCheck,
    colorClass: "bg-purple-700",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-700",
    dotColor: "bg-purple-300",
    items: [
      "Jurados verifican tu identidad",
      "Urnas selladas oficialmente",
      "Testigos de partidos vigilan el conteo",
      "Línea electoral: 1234 para denuncias",
    ],
    img: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&q=65",
    imgAlt: "Seguridad electoral",
  },
];

function Propaganda() {
  const [visible, setVisible] = useState([false, false, false, false]);
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    const observers = refs.map((ref, i) => {
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisible((prev) => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * 120);
            obs.disconnect();
          }
        },
        { threshold: 0.15 },
      );
      if (ref.current) obs.observe(ref.current);
      return obs;
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div
      id="propaganda"
      // className="w-full flex flex-col items-center justify-center p-0 space-y-10 py-10 px-4 bg-slate-400/15 dark:bg-slate-950"
      className="w-full flex flex-col items-center justify-center p-0 space-y-20 py-10 px-4 bg-white dark:bg-blue-900/80"
    >
      {/* ── Encabezado ── */}
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-3 text-blue-800 dark:text-blue-100">
          Información Electoral
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-xl mx-auto">
          Conoce tus derechos y deberes como ciudadano
        </p>
      </div>

      {/* ── Tarjetas ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-8xl ">
        {INFO_CARDS.map((card, i) => {
          const Icon = card.Icon;
          return (
            <div
              key={card.title}
              ref={refs[i]}
              className={`rounded-2xl overflow-hidden group cursor-default
                bg-blue-900 border border-slate-800 dark:bg-blue-950 dark:border-slate-700
                shadow-sm hover:shadow-xl hover:-translate-y-2
                transition-all duration-500 ease-out
                ${visible[i] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              {/* Imagen cabecera */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={card.img}
                  alt={card.imgAlt}
                  className="w-full h-full object-cover brightness-75 transition-transform duration-500 group-hover:scale-105"
                />

                {/* Ícono flotante */}
                <div
                  className={`absolute bottom-3 left-4 w-11 h-11 rounded-xl flex items-center justify-center shadow-md
                    transition-transform duration-300 group-hover:scale-110 ${card.iconBg}`}
                >
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>

                {/* Badge título */}
                <div
                  className={`absolute top-3 right-3 px-3 py-0.5 rounded-full text-xs font-bold text-white ${card.colorClass}`}
                >
                  {card.title}
                </div>
              </div>

              {/* Lista */}
              <div className="p-5">
                <ul className="space-y-2.5">
                  {card.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-white dark:text-gray-300"
                    >
                      <span
                        className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${card.dotColor}`}
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
  );
}

export default Propaganda;
