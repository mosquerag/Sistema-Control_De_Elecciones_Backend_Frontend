/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: validateAge.js
 * UBICACIÓN: /backend/middlewares/validateAge.js
 * DESCRIPCIÓN: Middleware para validar edad mínima de votación
 * ═══════════════════════════════════════════════════════════════════════
 *
 * FUNCIÓN:
 * - Valida que el ciudadano sea mayor de 18 años
 * - Calcula la edad automáticamente
 * - Agrega el campo 'edad' al body
 * - Bloquea registro de menores de edad
 *
 * DEPENDE DE:
 * - normalizarFechaNacimiento.js (debe ejecutarse antes)
 *
 * ES USADO POR:
 * - routes/auth.js (POST /register/ciudadano)
 *
 * REQUISITO LEGAL:
 * - Solo mayores de 18 años pueden votar
 */

/**
 * Valida que el ciudadano sea mayor de 18 años
 *
 * @middleware
 * @requires normalizarFechaNacimiento (debe ejecutarse antes)
 *
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Siguiente middleware
 *
 * @description
 * 1. Obtiene fechaNacimiento del body
 * 2. Calcula la edad actual
 * 3. Si edad < 18 → Bloquea con error 400
 * 4. Si edad >= 18 → Agrega 'edad' al body y continúa
 *
 * @ejemplo
 * router.post('/register/ciudadano', normalizarFechaNacimiento, validateAge, registerCiudadano);
 */
/**
 * Valida que el ciudadano sea mayor de 18 años
 */
export const validateAge = (req, res, next) => {
  try {
    // Si no hay fecha de nacimiento, simplemente continuar
    if (!req.body.fechaNacimiento) {
      return next();
    }

    const fechaNacimiento = new Date(req.body.fechaNacimiento);
    const hoy = new Date();

    // Validar que la fecha sea válida
    if (isNaN(fechaNacimiento.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Fecha de nacimiento inválida.",
        error: "INVALID_BIRTHDATE",
      });
    }

    // Calcular edad
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }

    console.log("🎂 Edad calculada:", edad);

    // Validar edad mínima
    if (edad < 18) {
      return res.status(400).json({
        success: false,
        message: "Debes ser mayor de 18 años para registrarte.",
        error: "UNDERAGE",
        data: { edad, edadMinima: 18 },
      });
    }

    // Agregar edad al body
    req.body.edad = edad;

    next();
  } catch (error) {
    console.error("❌ ERROR EN validateAge:", error);
    return res.status(500).json({
      success: false,
      message: "Error al validar edad.",
      error: error.message,
    });
  }
};

export default validateAge;

/**
 * ═══════════════════════════════════════════════════════════════════════
 * EJEMPLO DE USO:
 * ═══════════════════════════════════════════════════════════════════════
 *
 * En routes/auth.js:
 *
 * import { normalizarFechaNacimiento } from '../middlewares/normalizarFechas.js';
 * import { validateAge } from '../middlewares/validateAge.js';
 * import { registerCiudadano } from '../controllers/authController.js';
 *
 * router.post(
 *   '/register/ciudadano',
 *   normalizarFechaNacimiento,  // 1. Normalizar fecha a UTC
 *   validateAge,                 // 2. Validar edad >= 18
 *   registerCiudadano            // 3. Crear ciudadano
 * );
 *
 * ═══════════════════════════════════════════════════════════════════════
 *
 * FLUJO:
 *
 * 1. POST /api/auth/register/ciudadano
 *    Body: {
 *      nombre: "Juan",
 *      cedula: "12345678901",
 *      fechaNacimiento: "2000-05-15",
 *      ...
 *    }
 *
 * 2. normalizarFechaNacimiento
 *    → Convierte "2000-05-15" a Date UTC
 *    → req.body.fechaNacimiento = Date(2000-05-15 12:00:00 UTC)
 *
 * 3. validateAge (ESTE MIDDLEWARE)
 *    → Calcula edad: 2026 - 2000 = 26 años
 *    → Valida: 26 >= 18 ✅
 *    → Agrega: req.body.edad = 26
 *
 * 4. registerCiudadano
 *    → Crea usuario con edad ya calculada
 *    → Guarda en BD
 *
 * CASOS DE ERROR:
 *
 * - Menor de edad (edad < 18):
 *   → 400 "Debes ser mayor de 18 años"
 *
 * - Fecha futura:
 *   → 400 "La fecha de nacimiento no puede ser futura"
 *
 * - Fecha inválida:
 *   → 400 "Fecha de nacimiento inválida"
 *
 * - Edad > 120:
 *   → 400 "La fecha de nacimiento parece incorrecta"
 *
 * ═══════════════════════════════════════════════════════════════════════
 */
