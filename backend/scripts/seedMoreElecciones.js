/**
 * ═══════════════════════════════════════════════════════════════════════
 * seedMoreElecciones.js — Agrega 10 elecciones nuevas a VoteSecure
 * Ubicación sugerida: backend/scripts/seedMoreElecciones.js
 * Ejecutar con:  node scripts/seedMoreElecciones.js   (desde backend/)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * A diferencia de seedDemo.js, este script:
 *  - NO borra nada de la base de datos.
 *  - NO crea ciudadanos nuevos: reutiliza los 60 ciudadanos "activo"
 *    que ya existen en la BD (los que creó seedDemo.js).
 *  - Crea 10 tipos de elección + 10 elecciones nuevas, cada una con
 *    4 candidatos NUEVOS (ninguno repetido de los que ya existían).
 *  - Hace votar a los 60 ciudadanos existentes en cada una de las
 *    10 elecciones nuevas (600 votos nuevos en total), con una
 *    distribución 24/16/12/8 que deja 1°, 2°, 3° y 4° lugar claros,
 *    rotando quién gana en cada elección para variar los resultados.
 *
 * Requiere que ya existan al menos 60 ciudadanos "activo" en la BD.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import Usuario from "../models/Usuario.js";
import Eleccion from "../models/Eleccion.js";
import TipoEleccion from "../models/TipoEleccion.js";
import Voto from "../models/Voto.js";
import VotoAnonimo from "../models/VotoAnonimo.js";

dotenv.config();

const DRY_RUN = process.argv.includes("--dry-run");

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

// Offset alto para no chocar con las cédulas/índices ya usados por
// seedDemo.js (admins 0-1, candidatos 2-13, ciudadanos 14-73).
const OFFSET = 1000;

const cedula = (n) => String(10000000000 + n);
const hash = async (plain) => bcrypt.hash(plain, 12);
const slug = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");

function fecha(dia, mes, anio) {
  return new Date(Date.UTC(anio, mes - 1, dia));
}

const PAISES = [
  { nombre: "Colombia", cod: "57" },
  { nombre: "México", cod: "52" },
  { nombre: "Argentina", cod: "54" },
  { nombre: "Chile", cod: "56" },
  { nombre: "Perú", cod: "51" },
  { nombre: "Ecuador", cod: "593" },
  { nombre: "Venezuela", cod: "58" },
  { nombre: "Uruguay", cod: "598" },
  { nombre: "Panamá", cod: "507" },
  { nombre: "Bolivia", cod: "591" },
];

const telefono = (paisIdx, n) => {
  const pais = PAISES[paisIdx % PAISES.length];
  const suscriptor = String(700000000 + n).padStart(9, "0");
  return `+${pais.cod}${suscriptor}`;
};

const foto = (n, genero) =>
  `https://randomuser.me/api/portraits/${genero}/${n % 99}.jpg`;

// ═══════════════════════════════════════════════════════════════════════
// 10 ELECCIONES NUEVAS, CADA UNA CON 4 CANDIDATOS NUEVOS
// ═══════════════════════════════════════════════════════════════════════

const ELECCIONES_DEF = [
  {
    tipo: "Elección de Gobernación",
    titulo: "Elección Gobernación Regional 2026",
    descripcion: "Elección de gobernador de prueba para VoteSecure.",
    candidatos: [
      { nombre: "Federico Alonso Nieto Salazar", pais: "Colombia", partido: "Partido Región Unida", propuesta: "Vías rurales y agua potable para todos" },
      { nombre: "Marcela Ines Beltrán Roa", pais: "Chile", partido: "Movimiento Sur Adelante", propuesta: "Salud regional descentralizada" },
      { nombre: "Osvaldo Jesús Contreras Paz", pais: "Perú", partido: "Alianza Andina", propuesta: "Turismo y agroindustria sostenible" },
      { nombre: "Yolanda Patricia Escobar Ibarra", pais: "Ecuador", partido: "Frente Costa Verde", propuesta: "Reducción del desempleo juvenil" },
    ],
  },
  {
    tipo: "Elección Senatorial",
    titulo: "Elección Senado Nacional 2026",
    descripcion: "Elección senatorial de prueba para VoteSecure.",
    candidatos: [
      { nombre: "Rogelio Damián Ávila Cifuentes", pais: "México", partido: "Partido Nacional Renovador", propuesta: "Reforma laboral justa" },
      { nombre: "Silvana Maribel Torres Aguirre", pais: "Argentina", partido: "Unión Ciudadana Federal", propuesta: "Ley de transparencia pública" },
      { nombre: "Hugo Estéban Palacios Rincón", pais: "Venezuela", partido: "Bloque Democrático Libre", propuesta: "Inversión en ciencia y tecnología" },
      { nombre: "Norma Eliana Vásquez Salgado", pais: "Uruguay", partido: "Partido Nueva República", propuesta: "Protección al adulto mayor" },
    ],
  },
  {
    tipo: "Elección de Concejo Estudiantil",
    titulo: "Elección Concejo Estudiantil 2026",
    descripcion: "Elección de representante estudiantil de prueba para VoteSecure.",
    candidatos: [
      { nombre: "Kevin Santiago Ortega Villalba", pais: "Bolivia", partido: "Movimiento Estudiantes Unidos", propuesta: "Becas y biblioteca 24 horas" },
      { nombre: "Paola Ximena Rincón Guerrero", pais: "Panamá", partido: "Colectivo Voz Joven", propuesta: "Más actividades culturales" },
      { nombre: "Brayan Estiven Pardo Amaya", pais: "Guatemala", partido: "Frente Universitario Libre", propuesta: "Wifi gratuito en todo el campus" },
      { nombre: "Lorena Michelle Cuervo Betancur", pais: "República Dominicana", partido: "Alianza Campus Activo", propuesta: "Comedores estudiantiles subsidiados" },
    ],
  },
  {
    tipo: "Elección Sindical",
    titulo: "Elección Junta Sindical 2026",
    descripcion: "Elección de representación sindical de prueba para VoteSecure.",
    candidatos: [
      { nombre: "Wilmer Alexis Cárdenas Puentes", pais: "Costa Rica", partido: "Sindicato Trabajadores Unidos", propuesta: "Aumento salarial anual garantizado" },
      { nombre: "Deisy Carolina Mora Restrepo", pais: "Colombia", partido: "Frente Laboral Solidario", propuesta: "Seguridad industrial reforzada" },
      { nombre: "Anderson Julián Lozano Peña", pais: "México", partido: "Unión de Base Obrera", propuesta: "Jornada laboral flexible" },
      { nombre: "Katherine Vanessa Duarte Solís", pais: "Chile", partido: "Movimiento Trabajo Digno", propuesta: "Capacitación técnica gratuita" },
    ],
  },
  {
    tipo: "Elección Junta de Acción Comunal",
    titulo: "Elección Junta de Acción Comunal 2026",
    descripcion: "Elección comunal de prueba para VoteSecure.",
    candidatos: [
      { nombre: "Edwin Fabricio Salamanca Toro", pais: "Perú", partido: "Comunidad Barrio Unido", propuesta: "Mejoras en el parque central" },
      { nombre: "Rocío del Carmen Aponte Medina", pais: "Ecuador", partido: "Vecinos en Acción", propuesta: "Cámaras de seguridad barriales" },
      { nombre: "Nelson Iván Bautista Correa", pais: "Venezuela", partido: "Frente Comunitario Popular", propuesta: "Bazar comunitario mensual" },
      { nombre: "Diana Marcela Zapata Cuellar", pais: "Uruguay", partido: "Unidos por el Barrio", propuesta: "Programa de reciclaje vecinal" },
    ],
  },
  {
    tipo: "Elección Regional",
    titulo: "Elección Asamblea Regional 2026",
    descripcion: "Elección de asamblea regional de prueba para VoteSecure.",
    candidatos: [
      { nombre: "Camilo Andrés Guerrero Niño", pais: "Panamá", partido: "Alianza Regional Progresista", propuesta: "Infraestructura vial regional" },
      { nombre: "Astrid Johanna Meléndez Rueda", pais: "Bolivia", partido: "Movimiento Andino Renace", propuesta: "Energías renovables locales" },
      { nombre: "Duván Ricardo Cortés Villamil", pais: "Guatemala", partido: "Bloque Ciudadano Regional", propuesta: "Feria agrícola trimestral" },
      { nombre: "Ingrid Vanessa Prieto Cárdenas", pais: "República Dominicana", partido: "Frente Regional Verde", propuesta: "Protección de cuencas hídricas" },
    ],
  },
  {
    tipo: "Elección Distrital",
    titulo: "Elección Concejo Distrital 2026",
    descripcion: "Elección distrital de prueba para VoteSecure.",
    candidatos: [
      { nombre: "Harold Steven Buitrago Marín", pais: "Costa Rica", partido: "Distrito Unido", propuesta: "Ampliación de rutas de transporte" },
      { nombre: "Tatiana Alejandra Osorio Neira", pais: "Colombia", partido: "Movimiento Distrital Verde", propuesta: "Plan de arborización urbana" },
      { nombre: "Cristian Camilo Valbuena Ríos", pais: "México", partido: "Frente Vecinal Distrital", propuesta: "Reducción de tarifas de servicios" },
      { nombre: "Mónica Lizeth Caicedo Trujillo", pais: "Argentina", partido: "Alianza Ciudadana Distrital", propuesta: "Centros culturales barriales" },
    ],
  },
  {
    tipo: "Elección de Rector Universitario",
    titulo: "Elección Rectoría Universitaria 2026",
    descripcion: "Elección de rector universitario de prueba para VoteSecure.",
    candidatos: [
      { nombre: "Álvaro Enrique Vergara Cepeda", pais: "Chile", partido: "Claustro Académico Renovado", propuesta: "Más cupos de investigación" },
      { nombre: "Consuelo Beatriz Salazar Higuera", pais: "Perú", partido: "Movimiento Universidad Abierta", propuesta: "Becas para posgrado" },
      { nombre: "Rubén Darío Céspedes Aranda", pais: "Ecuador", partido: "Frente Docente Progresista", propuesta: "Laboratorios modernizados" },
      { nombre: "Liliana Esperanza Cantillo Ospina", pais: "Venezuela", partido: "Alianza Campus Futuro", propuesta: "Intercambios internacionales" },
    ],
  },
  {
    tipo: "Elección Junta Directiva Cooperativa",
    titulo: "Elección Junta Directiva Cooperativa 2026",
    descripcion: "Elección de junta cooperativa de prueba para VoteSecure.",
    candidatos: [
      { nombre: "Giovanny Alberto Rondón Suárez", pais: "Uruguay", partido: "Cooperativa Progreso Unido", propuesta: "Dividendos anuales más altos" },
      { nombre: "Marisol Andrea Fajardo Peláez", pais: "Panamá", partido: "Bloque Asociados Activos", propuesta: "Créditos blandos para socios" },
      { nombre: "Elkin Yamid Cifuentes Barreto", pais: "Bolivia", partido: "Unión Cooperativa Nacional", propuesta: "Auditoría financiera transparente" },
      { nombre: "Sandra Milena Quintero Arévalo", pais: "Guatemala", partido: "Frente Cooperativo Solidario", propuesta: "Capacitación en finanzas personales" },
    ],
  },
  {
    tipo: "Elección de Representante Vecinal",
    titulo: "Elección Representante Vecinal 2026",
    descripcion: "Elección de representante vecinal de prueba para VoteSecure.",
    candidatos: [
      { nombre: "Fabián Ricardo Montoya Serna", pais: "República Dominicana", partido: "Vecinos Primero", propuesta: "Alumbrado led en todas las calles" },
      { nombre: "Nathalia Vanesa Poveda Cifuentes", pais: "Costa Rica", partido: "Frente Vecinal Activo", propuesta: "Zonas verdes para mascotas" },
      { nombre: "Wilson Ferney Camacho Bermeo", pais: "Colombia", partido: "Movimiento Barrio Seguro", propuesta: "Cámaras y alarmas comunitarias" },
      { nombre: "Erika Julieth Naranjo Escobar", pais: "México", partido: "Unidos por mi Cuadra", propuesta: "Mantenimiento de andenes" },
    ],
  },
];

// Fechas de nacimiento para los 40 candidatos nuevos (día, mes, año)
const FECHAS_CANDIDATOS = [
  [11, 2, 1979], [24, 6, 1985], [3, 9, 1972], [16, 12, 1990],
  [7, 4, 1982], [29, 8, 1988], [19, 1, 1976], [2, 11, 1993],
  [14, 5, 1980], [27, 7, 1987], [9, 3, 1974], [22, 10, 1991],
  [5, 6, 1983], [18, 2, 1989], [30, 9, 1977], [13, 12, 1994],
  [26, 4, 1981], [8, 8, 1986], [21, 1, 1975], [4, 11, 1992],
  [17, 5, 1984], [1, 7, 1990], [12, 3, 1978], [25, 10, 1995],
  [6, 6, 1982], [19, 2, 1987], [31, 9, 1973], [14, 12, 1991],
  [27, 4, 1985], [10, 8, 1979], [23, 1, 1994], [3, 11, 1988],
  [16, 5, 1976], [29, 7, 1990], [11, 3, 1983], [24, 10, 1997],
  [7, 6, 1981], [20, 2, 1986], [2, 9, 1974], [15, 12, 1993],
];

// Reparto de votos: 24/16/12/8 = 40% / 26.7% / 20% / 13.3%
const REPARTO = [24, 16, 12, 8];

function ordenCandidatosParaEleccion(candidatos, eleccionIdx) {
  // Rota el orden para que el "1er lugar" no sea siempre el mismo
  // candidato de la lista, dando resultados variados por elección.
  const rot = eleccionIdx % candidatos.length;
  return [...candidatos.slice(rot), ...candidatos.slice(0, rot)];
}

function tramoParaCiudadano(indice) {
  if (indice < 24) return 0;
  if (indice < 40) return 1;
  if (indice < 52) return 2;
  return 3;
}

// ═══════════════════════════════════════════════════════════════════════
// VERIFICACIÓN DE UNICIDAD DE LOS CANDIDATOS NUEVOS (antes de tocar la BD)
// ═══════════════════════════════════════════════════════════════════════

function verificarUnicidad(candidatosPlanos) {
  const campos = ["nombre", "cedula", "email", "telefono"];
  for (const campo of campos) {
    const valores = candidatosPlanos.map((u) => u[campo]).filter(Boolean);
    const unicos = new Set(valores);
    if (unicos.size !== valores.length) {
      throw new Error(
        `❌ Valores duplicados en "${campo}" (${valores.length} valores, ${unicos.size} únicos)`,
      );
    }
  }
  console.log("✅ Verificación de unicidad OK para los candidatos nuevos.");
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════

async function main() {
  const candidatosPlanos = ELECCIONES_DEF.flatMap((e) => e.candidatos);

  const candidatosParaVerificar = candidatosPlanos.map((c, i) => ({
    nombre: c.nombre,
    cedula: cedula(OFFSET + i),
    email: `${slug(c.nombre.split(" ")[0])}.${slug(c.nombre.split(" ")[2])}@partidonuevo${i}.org`,
    telefono: telefono(i + 40, OFFSET + i),
  }));
  verificarUnicidad(candidatosParaVerificar);

  if (DRY_RUN) {
    console.log("\n--- MODO DRY-RUN: no se conecta a MongoDB, solo se valida la generación de datos ---");
    console.log(`Elecciones nuevas: ${ELECCIONES_DEF.length} | Candidatos nuevos: ${candidatosPlanos.length}`);
    return;
  }

  await mongoose.connect(process.env.MONGO);
  console.log("🔌 Conectado a MongoDB");

  // 1) Traer los 60 ciudadanos ya existentes (NO se crean, NO se borran)
  const ciudadanosExistentes = await Usuario.find({ rol: "ciudadano", estado: "activo" })
    .sort({ cedula: 1 })
    .limit(60);

  if (ciudadanosExistentes.length < 60) {
    throw new Error(
      `❌ Se esperaban 60 ciudadanos activos y solo se encontraron ${ciudadanosExistentes.length}. ` +
      `Corre primero seedDemo.js o ajusta este script.`,
    );
  }
  console.log(`🙋 ${ciudadanosExistentes.length} ciudadanos existentes encontrados (reutilizados, sin crear nuevos)`);

  // 2) Crear los 10 tipos de elección + elecciones + candidatos nuevos
  const ahora = new Date();
  const inicio = new Date(ahora.getTime() - 5 * 24 * 60 * 60 * 1000); // hace 5 días
  const fin = new Date(ahora.getTime() + 45 * 24 * 60 * 60 * 1000); // en 45 días

  const resumenElecciones = [];
  let candidatoGlobalIdx = 0;

  for (let e = 0; e < ELECCIONES_DEF.length; e++) {
    const def = ELECCIONES_DEF[e];

    const tipo = await TipoEleccion.create({
      nombre: def.tipo,
      descripcion: `Tipo de elección: ${def.tipo}`,
      activa: true,
    });

    const eleccion = await Eleccion.create({
      titulo: def.titulo,
      descripcion: def.descripcion,
      idTipoEleccion: tipo._id,
      fechaInicio: inicio,
      fechaFin: fin,
      estado: "en_votacion",
      activa: true,
      abiertaPostulacion: false,
    });

    const candidatosCreados = [];
    for (const c of def.candidatos) {
      const n = OFFSET + candidatoGlobalIdx;
      const [dia, mes, anio] = FECHAS_CANDIDATOS[candidatoGlobalIdx];
      const doc = await Usuario.create({
        nombre: c.nombre,
        cedula: cedula(n),
        email: `${slug(c.nombre.split(" ")[0])}.${slug(c.nombre.split(" ")[2])}@partidonuevo${candidatoGlobalIdx}.org`,
        password: await hash(`CandidatoNuevo${candidatoGlobalIdx}#2026`),
        fotoPerfil: foto(candidatoGlobalIdx + 200, candidatoGlobalIdx % 2 === 0 ? "men" : "women"),
        fechaNacimiento: fecha(dia, mes, anio),
        nacionalidad: c.pais,
        partido: c.partido,
        propuestas: c.propuesta,
        idEleccion: eleccion._id,
        rol: "candidato",
        estado: "activo",
        activo: true,
        totalVotos: 0,
      });
      candidatosCreados.push(doc);
      candidatoGlobalIdx++;
    }

    resumenElecciones.push({ eleccion, candidatos: candidatosCreados, idx: e });
  }
  console.log(`🗳️  ${ELECCIONES_DEF.length} elecciones nuevas creadas, con 4 candidatos nuevos cada una`);

  // 3) Votación: los 60 ciudadanos existentes votan en cada elección nueva
  let totalVotos = 0;
  for (const { eleccion, candidatos, idx } of resumenElecciones) {
    const ordenados = ordenCandidatosParaEleccion(candidatos, idx);

    for (let i = 0; i < ciudadanosExistentes.length; i++) {
      const ciudadano = ciudadanosExistentes[i];
      const candidato = ordenados[tramoParaCiudadano(i)];

      await Voto.create({
        idCiudadano: ciudadano._id,
        idEleccion: eleccion._id,
      });
      await VotoAnonimo.create({
        idEleccion: eleccion._id,
        idCandidato: candidato._id,
      });
      await Usuario.findByIdAndUpdate(candidato._id, { $inc: { totalVotos: 1 } });
      totalVotos++;
    }

    await Eleccion.findByIdAndUpdate(eleccion._id, {
      totalVotantes: ciudadanosExistentes.length,
    });
  }
  console.log(`🗳️  ${totalVotos} votos nuevos registrados (${resumenElecciones.length} elecciones × ${ciudadanosExistentes.length} ciudadanos)`);

  // 4) Resumen de resultados
  console.log("\n══════════════ RESULTADOS (elecciones nuevas) ══════════════");
  for (const { eleccion, candidatos, idx } of resumenElecciones) {
    const ordenados = ordenCandidatosParaEleccion(candidatos, idx);
    console.log(`\n📌 ${eleccion.titulo}`);
    const total = REPARTO.reduce((a, b) => a + b, 0);
    ordenados
      .map((c, i) => ({ c, votos: REPARTO[i] }))
      .sort((a, b) => b.votos - a.votos)
      .forEach((r, puesto) => {
        const pct = ((r.votos / total) * 100).toFixed(1);
        console.log(`  ${puesto + 1}° lugar: ${r.c.nombre} — ${r.votos} votos (${pct}%)`);
      });
  }

  console.log("\n══════════════ CREDENCIALES CANDIDATOS NUEVOS ══════════════");
  console.log("Login por cédula + contraseña, patrón: CandidatoNuevo<N>#2026");
  console.log(`  Ejemplo: cédula ${cedula(OFFSET)} / CandidatoNuevo0#2026`);

  await mongoose.disconnect();
  console.log("\n✅ Listo. Conexión cerrada.");
}

main().catch(async (err) => {
  console.error("💥 Error ejecutando el seed:", err);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});