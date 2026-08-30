/**
 * COMPONENTE: Ayuda.jsx
 * UBICACIÓN: /frontend/src/pages/Ayuda.jsx
 * DESCRIPCIÓN: Manual de uso integrado, con contenido según el rol del usuario
 */

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { HelpCircle, Vote, Users, Shield, ChevronDown } from "lucide-react";

const Seccion = ({ pregunta, children, abierta, onToggle }) => (
  <div className="border-b border-gray-200 dark:border-slate-700 py-4">
    <button
      onClick={onToggle}
      className="flex justify-between items-center w-full text-left"
    >
      <span className="font-semibold text-gray-800 dark:text-white">
        {pregunta}
      </span>
      <ChevronDown
        className={`w-5 h-5 text-gray-500 transition-transform ${
          abierta ? "rotate-180" : ""
        }`}
      />
    </button>
    {abierta && (
      <div className="mt-3 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
        {children}
      </div>
    )}
  </div>
);

const contenidoPorRol = {
  ciudadano: [
    {
      pregunta: "¿Cómo voto en una elección activa?",
      respuesta:
        "Ve a 'Elecciones Activas', entra a la elección, selecciona tu candidato y confirma. El voto es único por elección y no se puede repetir ni cambiar.",
    },
    {
      pregunta: "¿Mi voto es secreto?",
      respuesta:
        "Sí. El sistema registra que votaste (para impedir voto duplicado) por separado de por quién votaste, así que no queda un vínculo entre tu identidad y tu elección.",
    },
    {
      pregunta: "¿Dónde veo mi historial de votos?",
      respuesta:
        "En la sección 'Historial', donde aparecen todas las elecciones en las que ya participaste.",
    },
    {
      pregunta: "¿Cuándo puedo ver los resultados?",
      respuesta:
        "Los resultados públicos están disponibles una vez que la elección cierra, en la sección 'Resultados'.",
    },
  ],
  candidato: [
    {
      pregunta: "¿Cómo veo mis resultados?",
      respuesta:
        "En 'Mis Resultados' puedes consultar cuántos votos obtuviste y tu posición frente a otros candidatos, una vez cerrada la elección.",
    },
    {
      pregunta: "¿Puedo editar mi propuesta o partido?",
      respuesta:
        "Sí, desde tu perfil, siempre que la elección aún no haya iniciado.",
    },
  ],
  admin: [
    {
      pregunta: "¿Cómo apruebo o rechazo un usuario nuevo?",
      respuesta:
        "En 'Ciudadanos' o 'Candidatos' encontrarás la lista de cuentas pendientes de aprobación, con botones para aprobar o rechazar cada una.",
    },
    {
      pregunta: "¿Puedo editar una elección después de creada?",
      respuesta:
        "Sí, mientras no tenga votos registrados. Una vez que la elección tiene votos, el sistema bloquea el cambio de fechas y tipo de elección para proteger la integridad de los resultados.",
    },
    {
      pregunta: "¿Dónde veo las estadísticas generales?",
      respuesta:
        "En la sección 'Estadísticas', con participación y resultados de elecciones activas y cerradas.",
    },
  ],
};

const iconoPorRol = {
  ciudadano: <Vote className="w-6 h-6" />,
  candidato: <Users className="w-6 h-6" />,
  admin: <Shield className="w-6 h-6" />,
};

export default function Ayuda() {
  const { user } = useAuth();
  const rol = user?.rol || "ciudadano";
  const preguntas = contenidoPorRol[rol] || [];
  const [abierta, setAbierta] = useState(0);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
          {iconoPorRol[rol] || <HelpCircle className="w-6 h-6" />}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Manual de uso
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Preguntas frecuentes para tu cuenta de {rol}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 md:p-6">
        {preguntas.map((item, i) => (
          <Seccion
            key={i}
            pregunta={item.pregunta}
            abierta={abierta === i}
            onToggle={() => setAbierta(abierta === i ? null : i)}
          >
            {item.respuesta}
          </Seccion>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        ¿No encuentras lo que buscas? Contacta a soporte desde tu perfil.
      </p>
    </div>
  );
}