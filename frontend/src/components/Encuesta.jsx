import { useState } from "react";
import { CheckCircle } from "lucide-react";
import Button from "./common/Button";
import { enviarEncuesta } from "@/api/encuestas";
import { toastError } from "@/utils/alertas";

const PREGUNTA =
  "¿Qué tan satisfecho estás con los sistemas de votación digital actuales?";
const OPCIONES = [
  "Muy satisfecho con el sistema actual",
  "Satisfecho, pero necesita mejoras",
  "Neutral",
  "Insatisfecho con algunas características",
];

function Encuesta() {
  const [selectedOption, setSelectedOption] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVote = async () => {
    if (!selectedOption || loading) return;
    setLoading(true);
    try {
      await enviarEncuesta(selectedOption, PREGUNTA);
      setHasVoted(true);
    } catch {
      toastError("No se pudo registrar tu respuesta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full py-20 px-4 bg-slate-100 dark:bg-slate-900 flex justify-center">
      <div
        className="w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border border-blue-400 dark:border-blue-700 flex flex-col lg:flex-row"
        data-aos="fade-up"
      >
        {/* ── Columna izquierda — encuesta ── */}
        <div className="flex-1 p-8 bg-white dark:bg-blue-950 flex flex-col justify-center">
          {hasVoted ? (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 bg-emerald-100 dark:bg-emerald-900/50">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                ¡Gracias por tu respuesta!
              </h3>
              <p className="mb-5 text-slate-500 dark:text-slate-400">
                Tu opinión nos ayuda a mejorar continuamente.
              </p>
              <button
                onClick={() => {
                  setHasVoted(false);
                  setSelectedOption("");
                }}
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-all"
              >
                Responder nuevamente
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <span className="text-3xl mb-3 block">🗳️</span>
                <h2 className="text-3xl font-bold mb-2 text-blue-900 dark:text-slate-100">
                  Encuesta Rápida
                </h2>
                <p className="text-blue-500 dark:text-blue-400">{PREGUNTA}</p>
              </div>

              <div className="space-y-3 mb-6">
                {OPCIONES.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedOption === opt
                        ? "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950"
                        : "border-slate-200 dark:border-slate-600 bg-transparent hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-600 dark:hover:bg-blue-950/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="encuesta"
                      value={opt}
                      checked={selectedOption === opt}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="ml-3 text-sm font-medium text-slate-700 dark:text-blue-100">
                      {opt}
                    </span>
                  </label>
                ))}
              </div>

              <Button
                onClick={handleVote}
                disabled={!selectedOption || loading}
                // className="w-full py-3 rounded-xl font-semibold bg-slate-900 dark:bg-blue-600 hover:bg-slate-700 dark:hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 transition-all"
                // className="w-full py-3 rounded-xl font-semibold bg-slate-900 hover:bg-slate-700 text-white dark:!bg-blue-700 dark:!hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:!bg-blue-700 dark:disabled:text-blue-100 transition-all"
                className="w-full py-3 rounded-xl font-semibold bg-slate-900 hover:bg-slate-700 text-white dark:!bg-blue-900 dark:hover:!bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:!bg-blue-950 dark:disabled:text-blue-500 transition-all"
                // variant="info"
              >
                {loading ? "Enviando..." : "Enviar Respuesta"}
              </Button>
            </>
          )}
        </div>

        {/* ── Columna derecha — imagen ── */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&q=80"
            alt="Votación digital"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-8">
            <p className="text-blue-300 text-2xl font-bold leading-snug mb-2">
              Tu opinión construye la democracia
            </p>
            <p className="text-slate-300 text-sm">
              Cada respuesta nos ayuda a mejorar el sistema electoral digital
              del país.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Encuesta;
