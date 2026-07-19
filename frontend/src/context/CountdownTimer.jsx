
import { useState, useEffect } from "react";
import { mostrarAlerta } from "@/utils/alertas";

const LIMIT_MS = 5 * 60 * 1000;
const WAIT_MS = 20 * 60 * 1000;

const fmt = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const CountdownTimer = ({ tiempoInicio }) => {
  const [remaining, setRemaining] = useState(LIMIT_MS);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      const r = LIMIT_MS - (Date.now() - tiempoInicio);
      if (r <= 0) {
        setExpired(true);
        setRemaining(0);
        clearInterval(iv);
      } else {
        setRemaining(r);
      }
    }, 1000);

    return () => clearInterval(iv);
  }, [tiempoInicio]);

  useEffect(() => {
    if (expired) {
      const minutos = WAIT_MS / 1000 / 60;
      mostrarAlerta(
        "warning",
        "Tiempo expirado",
        `Espera ${minutos} minutos para volver a intentarlo con la misma cédula y correo.`,
      );
    }
  }, [expired]);

  if (expired) return null;

  const pct = (remaining / LIMIT_MS) * 100;
  const barColor =
    pct > 50 ? "bg-amber-500" : pct > 20 ? "bg-orange-500" : "bg-red-500";

  return (
    <div className="mt-3">
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs text-amber-600 dark:text-amber-400">
          ⏱ Tiempo restante:
        </span>
        <span
          className={`font-mono text-sm font-semibold ${
            pct > 50
              ? "text-amber-600 dark:text-amber-400"
              : pct > 20
                ? "text-orange-500"
                : "text-red-500"
          }`}
        >
          {fmt(remaining)}
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default CountdownTimer;
