export const normalizarFechasEleccion = (req, res, next) => {
  try {
    if (process.env.DEBUG_MODE === "true") {
      console.log("\n========================================");
      console.log("🔵 MIDDLEWARE normalizarFechasEleccion");
      console.log("📅 fechaInicio ORIGINAL:", req.body.fechaInicio);
      console.log("📅 fechaFin ORIGINAL:", req.body.fechaFin);
    }

    // Normalizar fecha de inicio (00:00:00 UTC)
    if (req.body.fechaInicio) {
      const fechaStr = req.body.fechaInicio;
      let inicioUTC;

      // Si es formato YYYY-MM-DD (desde frontend)
      if (
        typeof fechaStr === "string" &&
        fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)
      ) {
        const [year, month, day] = fechaStr.split("-").map(Number);
        inicioUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      } else {
        // Si es un objeto Date
        const inicio = new Date(fechaStr);
        inicioUTC = new Date(
          Date.UTC(
            inicio.getUTCFullYear(),
            inicio.getUTCMonth(),
            inicio.getUTCDate(),
            0,
            0,
            0,
            0,
          ),
        );
      }

      req.body.fechaInicio = inicioUTC;

      if (process.env.DEBUG_MODE === "true") {
        console.log("✅ fechaInicio NORMALIZADA (UTC):", inicioUTC);
        console.log("   Año:", inicioUTC.getUTCFullYear());
        console.log("   Mes:", inicioUTC.getUTCMonth() + 1);
        console.log("   Día:", inicioUTC.getUTCDate());
      }
    }

    // Normalizar fecha de fin (23:59:59 UTC)
    if (req.body.fechaFin) {
      const fechaStr = req.body.fechaFin;
      let finUTC;

      // Si es formato YYYY-MM-DD (desde frontend)
      if (
        typeof fechaStr === "string" &&
        fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)
      ) {
        const [year, month, day] = fechaStr.split("-").map(Number);
        finUTC = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      } else {
        // Si es un objeto Date
        const fin = new Date(fechaStr);
        finUTC = new Date(
          Date.UTC(
            fin.getUTCFullYear(),
            fin.getUTCMonth(),
            fin.getUTCDate(),
            23,
            59,
            59,
            999,
          ),
        );
      }

      req.body.fechaFin = finUTC;

      if (process.env.DEBUG_MODE === "true") {
        console.log("✅ fechaFin NORMALIZADA (UTC):", finUTC);
        console.log("   Año:", finUTC.getUTCFullYear());
        console.log("   Mes:", finUTC.getUTCMonth() + 1);
        console.log("   Día:", finUTC.getUTCDate());
      }
    }

    if (process.env.DEBUG_MODE === "true") {
      console.log("========================================\n");
    }

    next();
  } catch (error) {
    console.error("❌ ERROR EN MIDDLEWARE normalizarFechasEleccion:", error);
    res.status(400).json({
      success: false,
      message: "Error al procesar fechas: " + error.message,
      error: "INVALID_DATE_FORMAT",
    });
  }
};

/**
 * Normaliza fecha de nacimiento a UTC
 *
 * @middleware
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Siguiente middleware
 *
 * @description
 * - Convierte fechaNacimiento a UTC 12:00:00 (mediodía)
 * - Evita problemas con cálculo de edad
 * - Maneja formato YYYY-MM-DD correctamente
 *
 * @ejemplo
 * router.post('/register/ciudadano', normalizarFechaNacimiento, validateAge, registerCiudadano);
 */
export const normalizarFechaNacimiento = (req, res, next) => {
  try {
    if (req.body.fechaNacimiento) {
      const fechaStr = req.body.fechaNacimiento;
      let fechaUTC;

      if (
        typeof fechaStr === "string" &&
        fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)
      ) {
        const [year, month, day] = fechaStr.split("-").map(Number);
        fechaUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
      } else {
        const fecha = new Date(fechaStr);
        fechaUTC = new Date(
          Date.UTC(
            fecha.getUTCFullYear(),
            fecha.getUTCMonth(),
            fecha.getUTCDate(),
            12,
            0,
            0,
            0,
          ),
        );
      }

      req.body.fechaNacimiento = fechaUTC;

      if (process.env.DEBUG_MODE === "true") {
        console.log("✅ fechaNacimiento normalizada:", fechaUTC);
      }
    }

    next(); // ← ASEGÚRATE QUE ESTÉ AQUÍ
  } catch (error) {
    console.error("❌ ERROR EN normalizarFechaNacimiento:", error);
    return res.status(400).json({
      success: false,
      message: "Error al procesar fecha de nacimiento: " + error.message,
      error: "INVALID_DATE_FORMAT",
    });
  }
};

/**
 * Exportación por defecto
 */
export default {
  normalizarFechasEleccion,
  normalizarFechaNacimiento,
};
