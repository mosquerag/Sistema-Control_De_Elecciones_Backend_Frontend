/**
 * ═══════════════════════════════════════════════════════════════════════
 * backup.js — Respaldo diario de la base de datos (sin costo)
 * Ubicación: backend/scripts/backup.js
 * Ejecutar con:  node scripts/backup.js   (desde la carpeta backend/)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Por qué existe:
 * MongoDB Atlas en el tier gratuito (M0) NO incluye backups automáticos
 * (esa función solo viene en los planes pagos M10+). Este script hace lo
 * mismo por su cuenta: exporta cada colección de la base de datos a un
 * archivo JSON, en una carpeta con la fecha del día.
 *
 * Qué hace:
 *  1. Se conecta a la base usando la misma variable MONGO del .env
 *  2. Exporta TODAS las colecciones (usuarios, elecciones, votos, etc.)
 *     a archivos JSON dentro de backend/backups/AAAA-MM-DD/
 *  3. Borra automáticamente las carpetas de respaldo con más de 14 días,
 *     para no llenar el disco con el tiempo
 *
 * Cómo restaurar un respaldo si algo sale mal:
 *  - Cada archivo .json dentro de una carpeta de fecha es una colección
 *    completa. Se puede importar de vuelta con `mongoimport`, o con un
 *    script simple que lea el JSON e inserte los documentos con Mongoose.
 *  - Si nunca lo has hecho, avísame cuando llegue el momento y te doy
 *    el script de restauración — no hace falta tenerlo listo de antes.
 */

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const DIAS_A_CONSERVAR = 14;
const CARPETA_BACKUPS = path.resolve("backups");

const fechaDeHoy = () => {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const borrarBackupsAntiguos = () => {
  if (!fs.existsSync(CARPETA_BACKUPS)) return;

  const limite = Date.now() - DIAS_A_CONSERVAR * 24 * 60 * 60 * 1000;
  const carpetas = fs.readdirSync(CARPETA_BACKUPS);

  for (const carpeta of carpetas) {
    const rutaCompleta = path.join(CARPETA_BACKUPS, carpeta);
    const stats = fs.statSync(rutaCompleta);
    if (stats.isDirectory() && stats.birthtimeMs < limite) {
      fs.rmSync(rutaCompleta, { recursive: true, force: true });
      console.log(`🗑️  Backup antiguo eliminado: ${carpeta}`);
    }
  }
};

const hacerBackup = async () => {
  if (!process.env.MONGO) {
    console.error("❌ No se encontró la variable MONGO en el .env");
    process.exit(1);
  }

  console.log("🔌 Conectando a MongoDB...");
  await mongoose.connect(process.env.MONGO);

  const carpetaDestino = path.join(CARPETA_BACKUPS, fechaDeHoy());
  fs.mkdirSync(carpetaDestino, { recursive: true });

  const colecciones = await mongoose.connection.db.listCollections().toArray();

  console.log(`📦 Exportando ${colecciones.length} colecciones...`);

  for (const { name } of colecciones) {
    const documentos = await mongoose.connection.db
      .collection(name)
      .find({})
      .toArray();

    const rutaArchivo = path.join(carpetaDestino, `${name}.json`);
    fs.writeFileSync(rutaArchivo, JSON.stringify(documentos, null, 2));

    console.log(`   ✅ ${name} (${documentos.length} documentos)`);
  }

  console.log(`\n✅ Backup completo guardado en: ${carpetaDestino}`);

  borrarBackupsAntiguos();

  await mongoose.disconnect();
  process.exit(0);
};

hacerBackup().catch((error) => {
  console.error("❌ Error al hacer el backup:", error.message);
  process.exit(1);
});