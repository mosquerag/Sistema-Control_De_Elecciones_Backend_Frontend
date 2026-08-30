import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// ═══════════════════════════════════════════════════════════════════════
// HELPER: Mensaje de error estándar
// ═══════════════════════════════════════════════════════════════════════

const buildHandler = (mensaje) => (req, res) => {
  res.status(429).json({
    success: false,
    message: mensaje,
    error: "TOO_MANY_REQUESTS",
    retryAfter: res.getHeader("Retry-After"),
  });
};

// ═══════════════════════════════════════════════════════════════════════
// RATE LIMITER: LOGIN (Más estricto — previene brute force)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Limita intentos de login:
 * - Máximo 10 intentos por IP en 15 minutos
 * - Si supera el límite, bloquea 15 minutos más
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 intentos
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No cuenta los logins exitosos
  handler: buildHandler(
    "Demasiados intentos de inicio de sesión. Inténtalo de nuevo en 15 minutos.",
  ),
});

// ═══════════════════════════════════════════════════════════════════════
// RATE LIMITER: REGISTRO (Previene spam de cuentas)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Limita registros:
 * - Máximo 5 registros por IP en 1 hora
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildHandler(
    "Demasiados intentos de registro desde esta IP. Inténtalo de nuevo en 1 hora.",
  ),
});

// ═══════════════════════════════════════════════════════════════════════
// RATE LIMITER: API GENERAL
// ═══════════════════════════════════════════════════════════════════════

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 200 : 1000,
  message: {
    success: false,
    message: "Demasiadas peticiones, intenta más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ═══════════════════════════════════════════════════════════════════════
// RATE LIMITER: VOTACIÓN (Extremamente estricto)
// ═══════════════════════════════════════════════════════════════════════

export const voteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id?.toString() || ipKeyGenerator(req),
  handler: buildHandler(
    "Demasiados intentos de votación. Contacta al administrador si crees que es un error.",
  ),
});

// ═══════════════════════════════════════════════════════════════════════
// RATE LIMITER: RUTAS PÚBLICAS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Limita peticiones a rutas públicas (encuestas, estadísticas, etc.):
 * - Máximo 100 peticiones por IP en 10 minutos
 */
export const publicLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildHandler(
    "Demasiadas peticiones. Inténtalo de nuevo en unos minutos.",
  ),
});

// ═══════════════════════════════════════════════════════════════════════
// RATE LIMITER: RESTABLECER CONTRASEÑA (Previene fuerza bruta de cédula+email)
// ═══════════════════════════════════════════════════════════════════════

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildHandler(
    "Demasiados intentos de restablecer contraseña desde esta IP. Inténtalo de nuevo en 15 minutos.",
  ),
});

export default {
  loginLimiter,
  registerLimiter,
  apiLimiter,
  voteLimiter,
  publicLimiter,
  passwordResetLimiter,
};
