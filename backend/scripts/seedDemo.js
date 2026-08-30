/**
 * ═══════════════════════════════════════════════════════════════════════
 * seedDemo.js — Datos de prueba para VoteSecure
 * Ubicación sugerida: backend/scripts/seedDemo.js
 * Ejecutar con:  node scripts/seedDemo.js   (desde la carpeta backend/)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Qué hace:
 *  - Borra usuarios, elecciones, tipos de elección y votos existentes
 *  - Crea 2 administradores
 *  - Crea 3 tipos de elección y 3 elecciones distintas ("en_votacion")
 *  - Crea 12 candidatos (4 por elección, ninguno repetido)
 *  - Crea 60 ciudadanos (todos "activo", listos para iniciar sesión)
 *  - Hace que los 60 ciudadanos voten en las 3 elecciones (180 votos)
 *    con una distribución que deja un 1°, 2°, 3° y 4° lugar claro
 *    por cada elección.
 *  - Imprime un resumen de resultados y credenciales al final.
 *
 * Todas las contraseñas se guardan con el mismo hash (bcrypt, 12 rounds)
 * que usa authController.js, así que el login real de la app funciona
 * sin cambios.
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

const cedula = (n) => String(10000000000 + n); // siempre 11 dígitos
const hash = async (plain) => bcrypt.hash(plain, 12);
const slug = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");

function fecha(dia, mes, anio) {
  // mes en formato humano (1-12) -> Date (mes-1 para JS)
  return new Date(Date.UTC(anio, mes - 1, dia));
}

// ═══════════════════════════════════════════════════════════════════════
// PAÍSES (para variedad de nacionalidad, ciudad y prefijo telefónico)
// ═══════════════════════════════════════════════════════════════════════

const PAISES = [
  { nombre: "Colombia", cod: "57", ciudades: ["Medellín", "Cali", "Bucaramanga"] },
  { nombre: "México", cod: "52", ciudades: ["Guadalajara", "Monterrey", "Puebla"] },
  { nombre: "Argentina", cod: "54", ciudades: ["Córdoba", "Rosario", "Mendoza"] },
  { nombre: "Chile", cod: "56", ciudades: ["Valparaíso", "Concepción", "Antofagasta"] },
  { nombre: "Perú", cod: "51", ciudades: ["Arequipa", "Trujillo", "Cusco"] },
  { nombre: "Ecuador", cod: "593", ciudades: ["Cuenca", "Guayaquil", "Loja"] },
  { nombre: "Venezuela", cod: "58", ciudades: ["Maracaibo", "Valencia", "Barquisimeto"] },
  { nombre: "Uruguay", cod: "598", ciudades: ["Salto", "Paysandú", "Maldonado"] },
  { nombre: "Panamá", cod: "507", ciudades: ["Colón", "David", "La Chorrera"] },
  { nombre: "Bolivia", cod: "591", ciudades: ["Santa Cruz", "Cochabamba", "Sucre"] },
  { nombre: "Paraguay", cod: "595", ciudades: ["Ciudad del Este", "Encarnación", "Luque"] },
  { nombre: "Guatemala", cod: "502", ciudades: ["Quetzaltenango", "Antigua", "Escuintla"] },
  { nombre: "España", cod: "34", ciudades: ["Sevilla", "Valencia", "Bilbao"] },
  { nombre: "República Dominicana", cod: "1809", ciudades: ["Santiago", "La Vega", "Puerto Plata"] },
  { nombre: "Costa Rica", cod: "506", ciudades: ["Alajuela", "Heredia", "Cartago"] },
];

const telefono = (paisIdx, n) => {
  const pais = PAISES[paisIdx % PAISES.length];
  const suscriptor = String(700000000 + n).padStart(9, "0");
  return `+${pais.cod}${suscriptor}`;
};

const foto = (n, genero) =>
  `https://randomuser.me/api/portraits/${genero}/${n % 99}.jpg`;

// ═══════════════════════════════════════════════════════════════════════
// 2 ADMINISTRADORES
// ═══════════════════════════════════════════════════════════════════════

const ADMINS = [
  {
    nombre: "Andrés Felipe Restrepo Londoño",
    cedula: cedula(0),
    fechaNacimiento: fecha(14, 3, 1985),
    email: "andres.restrepo@votesecure.org",
    fotoPerfil: foto(32, "men"),
    password: "AdminUno#2026",
    pais: "Colombia",
  },
  {
    nombre: "Gabriela Isabel Moreno Castillo",
    cedula: cedula(1),
    fechaNacimiento: fecha(2, 9, 1979),
    email: "gabriela.moreno@votesecure.org",
    fotoPerfil: foto(65, "women"),
    password: "AdminDos#2026",
    pais: "España",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// 3 TIPOS DE ELECCIÓN + 3 ELECCIONES (cada una con 4 candidatos)
// ═══════════════════════════════════════════════════════════════════════

const ELECCIONES_DEF = [
  {
    tipo: "Elección Presidencial",
    titulo: "Elección Presidencial 2026",
    descripcion: "Elección presidencial de prueba para el sistema VoteSecure.",
    candidatos: [
      {
        nombre: "Lucas Ezequiel Fernández Molina",
        pais: "Argentina",
        partido: "Partido Progreso Nacional",
        propuesta: "Más empleo, salud y educación gratuita",
      },
      {
        nombre: "Valentina Sofía Castro Herrera",
        pais: "Chile",
        partido: "Movimiento Renovación Ciudadana",
        propuesta: "Seguridad, transparencia y desarrollo económico sostenible",
      },
      {
        nombre: "Ricardo Andrés Paredes Vargas",
        pais: "Perú",
        partido: "Alianza Popular Renovadora",
        propuesta: "Reducir impuestos y crear empleo digno",
      },
      {
        nombre: "Camila Beatriz Duarte Rojas",
        pais: "Uruguay",
        partido: "Frente Unidad Nacional",
        propuesta: "Vivienda digna para todas las familias",
      },
    ],
  },
  {
    tipo: "Elección Municipal",
    titulo: "Elección Alcaldía Capital 2026",
    descripcion: "Elección municipal de prueba para el sistema VoteSecure.",
    candidatos: [
      {
        nombre: "Mateo Sebastián Londoño Gil",
        pais: "Colombia",
        partido: "Partido Cívico Independiente",
        propuesta: "Más parques, menos tráfico, mejor movilidad",
      },
      {
        nombre: "Isabella Renata Fonseca Duarte",
        pais: "México",
        partido: "Movimiento Ciudadano Verde",
        propuesta: "Recolección de basura eficiente y puntual",
      },
      {
        nombre: "Diego Armando Salcedo Muñoz",
        pais: "Ecuador",
        partido: "Unión Democrática Local",
        propuesta: "Alumbrado público en todos los barrios",
      },
      {
        nombre: "Fernanda Alejandra Quintero Bravo",
        pais: "Venezuela",
        partido: "Partido Nueva Esperanza",
        propuesta: "Apoyo real a pequeños comerciantes locales",
      },
    ],
  },
  {
    tipo: "Elección Legislativa",
    titulo: "Elección Consejo Legislativo 2026",
    descripcion: "Elección legislativa de prueba para el sistema VoteSecure.",
    candidatos: [
      {
        nombre: "Joaquín Emilio Barreto Solano",
        pais: "Panamá",
        partido: "Bloque Legislativo Progresista",
        propuesta: "Leyes claras contra la corrupción",
      },
      {
        nombre: "Antonella Milagros Rueda Campos",
        pais: "Bolivia",
        partido: "Coalición Reforma Social",
        propuesta: "Más inversión en salud pública",
      },
      {
        nombre: "Tomás Gabriel Escalante Vidal",
        pais: "Paraguay",
        partido: "Movimiento Justicia y Trabajo",
        propuesta: "Pensiones dignas para adultos mayores",
      },
      {
        nombre: "Daniela Constanza Bermúdez León",
        pais: "Guatemala",
        partido: "Frente Cívico Renovador",
        propuesta: "Educación técnica gratuita para jóvenes",
      },
    ],
  },
];

// Fechas de nacimiento de los 12 candidatos (día, mes, año) — todas distintas
const FECHAS_CANDIDATOS = [
  [9, 11, 1980], [17, 4, 1988], [23, 6, 1975], [30, 1, 1992],
  [5, 8, 1983], [12, 12, 1990], [28, 2, 1977], [19, 5, 1986],
  [3, 10, 1981], [25, 7, 1994], [14, 9, 1978], [8, 3, 1989],
];

// ═══════════════════════════════════════════════════════════════════════
// 60 CIUDADANOS
// ═══════════════════════════════════════════════════════════════════════

const NOMBRES = [
  // 30 masculinos
  "Alejandro", "Sebastián", "Mateo", "Nicolás", "Samuel", "Emiliano", "Benjamín",
  "Joaquín", "Martín", "Gabriel", "Santiago", "Tomás", "Bruno", "Ignacio", "Rodrigo",
  "Julián", "Maximiliano", "Agustín", "Felipe", "Emilio", "Adrián", "Álvaro",
  "Cristian", "Damián", "Esteban", "Fabián", "Gonzalo", "Hernán", "Iván", "Jorge",
  // 30 femeninos
  "Valentina", "Sofía", "Isabella", "Camila", "Martina", "Emma", "Mariana",
  "Victoria", "Renata", "Antonella", "Regina", "Ximena", "Paula", "Daniela",
  "Fernanda", "Gabriela", "Lucía", "Natalia", "Adriana", "Carolina", "Alejandra",
  "Beatriz", "Claudia", "Diana", "Elena", "Francisca", "Georgina", "Helena",
  "Irene", "Julieta",
];

const APELLIDOS = [
  "García", "Rodríguez", "Martínez", "Hernández", "López", "González", "Pérez",
  "Sánchez", "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Cruz",
  "Reyes", "Morales", "Ortiz", "Gutiérrez", "Chávez", "Ramos", "Vargas", "Castro",
  "Jiménez", "Rojas", "Mendoza", "Silva", "Vega", "Aguilar", "Campos", "Navarro",
  "Delgado", "Herrera", "Peña", "Contreras", "Núñez", "Cabrera", "Espinoza",
  "Bravo", "Molina",
];

function generarCiudadanos(offset) {
  const ciudadanos = [];
  for (let i = 0; i < 60; i++) {
    const idx = offset + i;
    const genero = i < 30 ? "men" : "women";
    const nombrePila = NOMBRES[i];
    const ap1 = APELLIDOS[i % APELLIDOS.length];
    const ap2 = APELLIDOS[(i * 7 + 13) % APELLIDOS.length];
    const nombreCompleto = `${nombrePila} ${ap1} ${ap2}`;
    const pais = PAISES[i % PAISES.length];
    const ciudad = pais.ciudades[i % pais.ciudades.length];

    // Edades entre ~19 y ~68 años (respecto a 2026)
    const anioNac = 1958 + (i % 50);
    const mesNac = (i % 12) + 1;
    const diaNac = (i % 28) + 1;

    ciudadanos.push({
      nombre: nombreCompleto,
      cedula: cedula(idx),
      fechaNacimiento: fecha(diaNac, mesNac, anioNac),
      email: `${slug(nombrePila)}.${slug(ap1)}${idx}@correo.com`,
      telefono: telefono(i, idx),
      municipio: ciudad,
      direccion: `Calle ${10 + i} #${(i * 3) % 90}-${(i * 5) % 80}, ${ciudad}`,
      fotoPerfil: foto(idx, genero),
      pais: pais.nombre,
      password: `Ciudadano${idx}#2026`,
    });
  }
  return ciudadanos;
}

// ═══════════════════════════════════════════════════════════════════════
// VERIFICACIÓN DE UNICIDAD (antes de tocar la base de datos)
// ═══════════════════════════════════════════════════════════════════════

function verificarUnicidad(todos) {
  const campos = ["nombre", "cedula", "email", "telefono"];
  for (const campo of campos) {
    const valores = todos.map((u) => u[campo]).filter(Boolean);
    const unicos = new Set(valores);
    if (unicos.size !== valores.length) {
      throw new Error(
        `❌ Se encontraron valores duplicados en el campo "${campo}" (${valores.length} valores, ${unicos.size} únicos)`,
      );
    }
    for (const v of valores) {
      if (campo === "cedula" && !/^\d{11}$/.test(v)) {
        throw new Error(`❌ Cédula inválida (no son 11 dígitos): ${v}`);
      }
      if (campo === "telefono" && !/^\+[1-9]\d{7,14}$/.test(v)) {
        throw new Error(`❌ Teléfono con formato inválido: ${v}`);
      }
    }
  }
  console.log("✅ Verificación de unicidad OK: nombre, cédula, email y teléfono son todos distintos.");
}

// ═══════════════════════════════════════════════════════════════════════
// DISTRIBUCIÓN DE VOTOS POR ELECCIÓN (60 ciudadanos → 4 candidatos)
// 24 / 16 / 12 / 8  =  40% / 26.7% / 20% / 13.3%  → 1°, 2°, 3°, 4° puesto
// ═══════════════════════════════════════════════════════════════════════

const REPARTO = [24, 16, 12, 8];

function asignarCandidatoPorVoto(indiceCiudadano) {
  // Devuelve 0,1,2 o 3 según en qué tramo cae el ciudadano (0-23, 24-39, 40-51, 52-59)
  if (indiceCiudadano < 24) return 0;
  if (indiceCiudadano < 40) return 1;
  if (indiceCiudadano < 52) return 2;
  return 3;
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════

async function main() {
  const ciudadanos = generarCiudadanos(14); // índices 14-73, para no chocar con admins(0-1) y candidatos(2-13)
  const candidatosPlanos = ELECCIONES_DEF.flatMap((e) => e.candidatos);

  const todosLosDatos = [
    ...ADMINS,
    ...candidatosPlanos.map((c, i) => ({
      nombre: c.nombre,
      cedula: cedula(2 + i),
      email: `${slug(c.nombre.split(" ")[0])}.${slug(c.nombre.split(" ")[2])}@partido${i}.org`,
      telefono: telefono(i + 20, 2 + i),
    })),
    ...ciudadanos,
  ];

  verificarUnicidad(todosLosDatos);

  if (DRY_RUN) {
    console.log("\n--- MODO DRY-RUN: no se conecta a MongoDB, solo se valida la generación de datos ---");
    console.log(`Admins: ${ADMINS.length} | Candidatos: ${candidatosPlanos.length} | Ciudadanos: ${ciudadanos.length}`);
    console.log("Ejemplo ciudadano #0:", ciudadanos[0]);
    console.log("Ejemplo ciudadano #59:", ciudadanos[59]);
    return;
  }

  await mongoose.connect(process.env.MONGO);
  console.log("🔌 Conectado a MongoDB");

  // 1) Limpieza total (equivalente a "eliminar todo")
  await Promise.all([
    Usuario.deleteMany({}),
    Eleccion.deleteMany({}),
    TipoEleccion.deleteMany({}),
    Voto.deleteMany({}),
    VotoAnonimo.deleteMany({}),
  ]);
  console.log("🧹 Colecciones limpiadas");

  // 2) Admins
  const adminsCreados = [];
  for (const a of ADMINS) {
    const doc = await Usuario.create({
      nombre: a.nombre,
      cedula: a.cedula,
      email: a.email,
      password: await hash(a.password),
      fotoPerfil: a.fotoPerfil,
      fechaNacimiento: a.fechaNacimiento,
      nacionalidad: a.pais,
      rol: "admin",
      estado: "activo",
      activo: true,
    });
    adminsCreados.push(doc);
  }
  console.log(`👑 ${adminsCreados.length} administradores creados`);

  // 3) Tipos de elección + elecciones + candidatos
  const ahora = new Date();
  const inicio = new Date(ahora.getTime() - 15 * 24 * 60 * 60 * 1000); // hace 15 días
  const fin = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000); // en 30 días

  const resumenElecciones = [];
  let candidatoGlobalIdx = 0;

  for (const def of ELECCIONES_DEF) {
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
      const [dia, mes, anio] = FECHAS_CANDIDATOS[candidatoGlobalIdx];
      const doc = await Usuario.create({
        nombre: c.nombre,
        cedula: cedula(2 + candidatoGlobalIdx),
        email: `${slug(c.nombre.split(" ")[0])}.${slug(c.nombre.split(" ")[2])}@partido${candidatoGlobalIdx}.org`,
        password: await hash(`Candidato${candidatoGlobalIdx}#2026`),
        fotoPerfil: foto(candidatoGlobalIdx + 40, candidatoGlobalIdx % 2 === 0 ? "men" : "women"),
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

    resumenElecciones.push({ tipo, eleccion, candidatos: candidatosCreados });
  }
  console.log(`🗳️  ${ELECCIONES_DEF.length} elecciones creadas, con 4 candidatos cada una`);

  // 4) Ciudadanos
  const ciudadanosCreados = [];
  for (const c of ciudadanos) {
    const doc = await Usuario.create({
      nombre: c.nombre,
      cedula: c.cedula,
      email: c.email,
      password: await hash(c.password),
      fotoPerfil: c.fotoPerfil,
      fechaNacimiento: c.fechaNacimiento,
      nacionalidad: c.pais,
      telefono: c.telefono,
      municipio: c.municipio,
      direccion: c.direccion,
      rol: "ciudadano",
      estado: "activo",
      activo: true,
    });
    ciudadanosCreados.push(doc);
  }
  console.log(`🙋 ${ciudadanosCreados.length} ciudadanos creados`);

  // 5) Votación: los 60 ciudadanos votan en las 3 elecciones
  for (const { eleccion, candidatos } of resumenElecciones) {
    for (let i = 0; i < ciudadanosCreados.length; i++) {
      const ciudadano = ciudadanosCreados[i];
      const candidato = candidatos[asignarCandidatoPorVoto(i)];

      await Voto.create({
        idCiudadano: ciudadano._id,
        idEleccion: eleccion._id,
      });
      await VotoAnonimo.create({
        idEleccion: eleccion._id,
        idCandidato: candidato._id,
      });
      await Usuario.findByIdAndUpdate(candidato._id, { $inc: { totalVotos: 1 } });
    }
    await Eleccion.findByIdAndUpdate(eleccion._id, {
      totalVotantes: ciudadanosCreados.length,
    });
  }
  console.log(`🗳️  ${resumenElecciones.length * ciudadanosCreados.length} votos registrados`);

  // 6) Resumen de resultados
  console.log("\n══════════════ RESULTADOS ══════════════");
  for (const { eleccion, candidatos } of resumenElecciones) {
    console.log(`\n📌 ${eleccion.titulo}`);
    const total = REPARTO.reduce((a, b) => a + b, 0);
    candidatos
      .map((c, i) => ({ c, votos: REPARTO[i] }))
      .sort((a, b) => b.votos - a.votos)
      .forEach((r, puesto) => {
        const pct = ((r.votos / total) * 100).toFixed(1);
        console.log(`  ${puesto + 1}° lugar: ${r.c.nombre} — ${r.votos} votos (${pct}%)`);
      });
  }

  console.log("\n══════════════ CREDENCIALES ══════════════");
  console.log("Admins (login por email + contraseña):");
  ADMINS.forEach((a) => console.log(`  - ${a.email} / ${a.password}`));
  console.log("\nCiudadanos (login por cédula + contraseña), patrón: Ciudadano<N>#2026");
  console.log(`  Ejemplo: cédula ${ciudadanos[0].cedula} / ${ciudadanos[0].password}`);
  console.log("\nCandidatos (login por cédula + contraseña), patrón: Candidato<N>#2026");
  console.log(`  Ejemplo: cédula ${cedula(2)} / Candidato0#2026`);

  await mongoose.disconnect();
  console.log("\n✅ Listo. Conexión cerrada.");
}

main().catch(async (err) => {
  console.error("💥 Error ejecutando el seed:", err);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});