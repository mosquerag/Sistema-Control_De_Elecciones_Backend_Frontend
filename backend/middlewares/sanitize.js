/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: sanitize.js
 * UBICACIÓN: /backend/middlewares/sanitize.js
 * DESCRIPCIÓN: Sanitización y validación de inputs para prevenir inyecciones
 * ═══════════════════════════════════════════════════════════════════════
 *
 * FUNCIÓN:
 * - Sanitiza inputs para prevenir XSS, NoSQL injection, SQL injection
 * - Elimina caracteres peligrosos de los inputs
 * - Valida longitud y formato de campos críticos
 * - Previene prototype pollution
 *
 * INSTALACIÓN REQUERIDA:
 * npm install express-mongo-sanitize xss
 *
 * DEPENDE DE:
 * - express-mongo-sanitize (previene NoSQL injection)
 * - xss (previene Cross-Site Scripting)
 *
 * ES USADO POR:
 * - /backend/index.js (aplicado globalmente)
 */

import mongoSanitize from "express-mongo-sanitize";
import xss from "xss";

// ═══════════════════════════════════════════════════════════════════════
// SANITIZACIÓN CONTRA NoSQL INJECTION
// ═══════════════════════════════════════════════════════════════════════

/**
 * Previene ataques de inyección en MongoDB
 * Elimina claves que comienzan con '$' o contienen '.'
 *
 * Ejemplo de ataque bloqueado:
 * { "email": { "$gt": "" } }  → Eliminado automáticamente
 */
export const sanitizeMongo = mongoSanitize({
  replaceWith: "_",
  allowDots: false,
  onSanitize: ({ req, key }) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `⚠️ Intento de NoSQL injection bloqueado: key="${key}" IP=${req.ip}`,
      );
    }
  },
});

// ═══════════════════════════════════════════════════════════════════════
// SANITIZACIÓN XSS — Limpia HTML malicioso de inputs de texto
// ═══════════════════════════════════════════════════════════════════════

/**
 * Limpia HTML y scripts maliciosos de todos los campos de texto
 * Recorre req.body, req.query y req.params recursivamente
 */
const sanitizeValue = (value) => {
  if (typeof value === "string") {
    return xss(value.trim(), {
      whiteList: {}, // No permitir ningún HTML
      stripIgnoreTag: true,
      stripIgnoreTagBody: ["script"],
    });
  }
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const sanitized = {};
    for (const key of Object.keys(value)) {
      // Prevenir prototype pollution
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }
      sanitized[key] = sanitizeValue(value[key]);
    }
    return sanitized;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  return value;
};

export const sanitizeInputs = (req, res, next) => {
  try {
    // No sanitizar campos de imagen (Base64) para no corromperlos
    const imageFields = ["fotoPerfil", "foto", "imagen", "image"];

    if (req.body && typeof req.body === "object") {
      const sanitized = {};
      for (const [key, value] of Object.entries(req.body)) {
        if (imageFields.includes(key)) {
          sanitized[key] = value; // Preservar Base64 sin sanitizar
        } else {
          sanitized[key] = sanitizeValue(value);
        }
      }
      req.body = sanitized;
    }

    if (req.query) {
      req.query = sanitizeValue(req.query);
    }

    if (req.params) {
      req.params = sanitizeValue(req.params);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════
// VALIDACIONES ESPECÍFICAS DE CAMPOS CRÍTICOS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Valida y sanitiza campos de autenticación específicamente
 */
// export const validateAuthInputs = (req, res, next) => {
//   const { email, password, cedula, nombre } = req.body;

//   // Validar email si existe
//   if (email !== undefined) {
//     if (typeof email !== "string" || email.length > 254) {
//       return res.status(400).json({
//         success: false,
//         message: "Email inválido.",
//         error: "INVALID_EMAIL",
//       });
//     }
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Formato de email inválido.",
//         error: "INVALID_EMAIL_FORMAT",
//       });
//     }
//     // Normalizar email
//     req.body.email = email.toLowerCase().trim();
//   }

//   // Validar cédula si existe (exactamente 11 dígitos numéricos)
//   if (cedula !== undefined) {
//     const cedulaStr = String(cedula).trim();
//     if (!/^\d{11}$/.test(cedulaStr)) {
//       return res.status(400).json({
//         success: false,
//         message: "La cédula debe tener exactamente 11 dígitos numéricos.",
//         error: "INVALID_CEDULA",
//       });
//     }
//     req.body.cedula = cedulaStr;
//   }

//   // Validar password si existe
//   if (password !== undefined) {
//     if (typeof password !== "string") {
//       return res.status(400).json({
//         success: false,
//         message: "Contraseña inválida.",
//         error: "INVALID_PASSWORD",
//       });
//     }
//     if (password.length < 6 || password.length > 128) {
//       return res.status(400).json({
//         success: false,
//         message: "La contraseña debe tener entre 6 y 128 caracteres.",
//         error: "INVALID_PASSWORD_LENGTH",
//       });
//     }
//   }

//   // Validar nombre si existe
//   if (nombre !== undefined) {
//     if (
//       typeof nombre !== "string" ||
//       nombre.trim().length < 3 ||
//       nombre.trim().length > 100
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "El nombre debe tener entre 3 y 100 caracteres.",
//         error: "INVALID_NAME",
//       });
//     }
//     req.body.nombre = nombre.trim();
//   }

//   next();
// };

export const validateAuthInputs = (req, res, next) => {
  const { email, password, cedula } = req.body;
  const ruta = req.path;

  // Registro por admin — solo requiere nombre y cédula
  if (ruta.includes("/admin/register/")) {
    return next();
  }

  // Login admin — requiere email y password
  if (ruta.includes("/login/admin")) {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son obligatorios.",
        error: "MISSING_FIELDS",
      });
    }
    return next();
  }

  // Login ciudadano/candidato — requiere cédula
  if (ruta.includes("/login/")) {
    if (!cedula) {
      return res.status(400).json({
        success: false,
        message: "Cédula es obligatoria.",
        error: "MISSING_FIELDS",
      });
    }
    return next();
  }

  next();
};

/**
 * Valida IDs de MongoDB en parámetros de ruta
 */
export const validateMongoId = (req, res, next) => {
  const { id } = req.params;
  if (id && !/^[a-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: "ID inválido.",
      error: "INVALID_ID",
    });
  }
  next();
};

export default {
  sanitizeMongo,
  sanitizeInputs,
  validateAuthInputs,
  validateMongoId,
};
