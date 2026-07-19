/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: forgotPasswordController.js
 * UBICACIÓN: /backend/controllers/forgotPasswordController.js
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Flujo sin email:
 * 1. POST /api/auth/verify-identity  → verifica cédula + email, devuelve userId temporal
 * 2. POST /api/auth/reset-password   → recibe userId + nueva contraseña
 */

import Usuario from "../models/Usuario.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

// ── Paso 1: Verificar identidad (cédula + email) ──────────────────────
// export const verifyIdentity = async (req, res) => {
//   try {
//     const { cedula, email } = req.body;

//     if (!cedula || !email) {
//       return res.status(400).json({
//         success: false,
//         message: 'Cédula y email son obligatorios.',
//         error: 'MISSING_FIELDS',
//       });
//     }

//     // Buscar usuario con esa cédula Y ese email
//     const usuario = await Usuario.findOne({
//       cedula: cedula.trim(),
//       email:  email.trim().toLowerCase(),
//     });

//     if (!usuario) {
//       return res.status(404).json({
//         success: false,
//         message: 'No encontramos una cuenta con esa cédula y email.',
//         error: 'USER_NOT_FOUND',
//       });
//     }

//     if (usuario.esGoogleAuth) {
//       return res.status(400).json({
//         success: false,
//         message: 'Esta cuenta usa Google para iniciar sesión. No puedes cambiar la contraseña aquí.',
//         error: 'GOOGLE_AUTH_USER',
//       });
//     }

//     // Generar token temporal de 15 minutos
//     const resetToken = jwt.sign(
//       { id: usuario._id, type: 'reset_password' },
//       process.env.JWT_SECRET,
//     //   { expiresIn: '15m' },
//     { expiresIn: '5m' },
//     );

//     return res.status(200).json({
//       success: true,
//       message: 'Identidad verificada correctamente.',
//       data: {
//         resetToken,
//         nombre: usuario.nombre,
//         rol:    usuario.rol,
//       },
//     });
//   } catch (error) {
//     console.error('Error en verifyIdentity:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error al verificar identidad.',
//       error: isProduction ? 'SERVER_ERROR' : error.message,
//     });
//   }
// };

export const verifyIdentity = async (req, res) => {
  try {
    const { cedula, email } = req.body;

    if (!cedula || !email) {
      return res.status(400).json({
        success: false,
        message: "Cédula y email son obligatorios.",
        error: "MISSING_FIELDS",
      });
    }

    const usuario = await Usuario.findOne({
      cedula: cedula.trim(),
      email: email.trim().toLowerCase(),
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "No encontramos una cuenta con esa cédula y email.",
        error: "USER_NOT_FOUND",
      });
    }

    if (usuario.esGoogleAuth) {
      return res.status(400).json({
        success: false,
        message:
          "Esta cuenta usa Google para iniciar sesión. No puedes cambiar la contraseña aquí.",
        error: "GOOGLE_AUTH_USER",
      });
    }

    // ── Verificar si está bloqueado ──────────────────────────
    if (
      usuario.passwordResetBlockedUntil &&
      usuario.passwordResetBlockedUntil > new Date()
    ) {
      const minutosRestantes = Math.ceil(
        (usuario.passwordResetBlockedUntil - new Date()) / 1000 / 60,
      );
      return res.status(429).json({
        success: false,
        message: `Debes esperar ${minutosRestantes} minuto(s) antes de volver a intentarlo con esta cédula y correo.`,
        error: "RESET_BLOCKED",
        minutosRestantes,
      });
    }

    const resetToken = jwt.sign(
      { id: usuario._id, type: "reset_password" },
      process.env.JWT_SECRET,
      { expiresIn: "5m" },
    );

    // ── Guardar cuándo se generó el token ────────────────────
    usuario.passwordResetTokenAt = new Date();
    await usuario.save();

    return res.status(200).json({
      success: true,
      message: "Identidad verificada correctamente.",
      data: {
        resetToken,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error en verifyIdentity:", error);
    return res.status(500).json({
      success: false,
      message: "Error al verificar identidad.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

// ── Paso 2: Cambiar contraseña con token temporal ─────────────────────
// export const resetPassword = async (req, res) => {
//   try {
//     const { resetToken, passwordNueva, confirmPassword } = req.body;

//     if (!resetToken || !passwordNueva || !confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "Token, contraseña nueva y confirmación son obligatorios.",
//         error: "MISSING_FIELDS",
//       });
//     }

//     if (passwordNueva !== confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "Las contraseñas no coinciden.",
//         error: "PASSWORD_MISMATCH",
//       });
//     }

//     if (passwordNueva.length < 6 || passwordNueva.length > 128) {
//       return res.status(400).json({
//         success: false,
//         message: "La contraseña debe tener entre 6 y 128 caracteres.",
//         error: "INVALID_PASSWORD_LENGTH",
//       });
//     }

//     // Verificar token temporal
//     let decoded;
//     try {
//       decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
//     } catch (err) {
//       return res.status(401).json({
//         success: false,
//         message:
//           err.name === "TokenExpiredError"
//             ? "El tiempo para cambiar la contraseña expiró (5 min). Vuelve a verificar tu identidad."
//             : "Token inválido.",
//         error:
//           err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
//       });
//     }

//     if (decoded.type !== "reset_password") {
//       return res.status(401).json({
//         success: false,
//         message: "Token inválido.",
//         error: "INVALID_TOKEN_TYPE",
//       });
//     }

//     const usuario = await Usuario.findById(decoded.id);
//     if (!usuario) {
//       return res.status(404).json({
//         success: false,
//         message: "Usuario no encontrado.",
//         error: "USER_NOT_FOUND",
//       });
//     }

//     const salt = await bcrypt.genSalt(12);
//     usuario.password = await bcrypt.hash(passwordNueva, salt);
//     await usuario.save();

//     return res.status(200).json({
//       success: true,
//       message:
//         "¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión.",
//     });
//   } catch (error) {
//     console.error("Error en resetPassword:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error al cambiar la contraseña.",
//       error: isProduction ? "SERVER_ERROR" : error.message,
//     });
//   }
// };

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, passwordNueva, confirmPassword } = req.body;

    if (!resetToken || !passwordNueva || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Token, contraseña nueva y confirmación son obligatorios.",
        error: "MISSING_FIELDS",
      });
    }

    if (passwordNueva !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Las contraseñas no coinciden.",
        error: "PASSWORD_MISMATCH",
      });
    }

    if (passwordNueva.length < 6 || passwordNueva.length > 128) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener entre 6 y 128 caracteres.",
        error: "INVALID_PASSWORD_LENGTH",
      });
    }

    // Verificar token temporal
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        // Bloquear al usuario por 20 minutos
        const payload = jwt.decode(resetToken);
        if (payload?.id) {
          await Usuario.findByIdAndUpdate(payload.id, {
            passwordResetBlockedUntil: new Date(Date.now() + 20 * 60 * 1000),
          });
        }
        return res.status(401).json({
          success: false,
          message: "El tiempo expiró (5 min). Debes esperar 20 minutos para volver a intentarlo con la misma cédula y correo.",
          error: "TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Token inválido.",
        error: "INVALID_TOKEN",
      });
    }

    if (decoded.type !== "reset_password") {
      return res.status(401).json({
        success: false,
        message: "Token inválido.",
        error: "INVALID_TOKEN_TYPE",
      });
    }

    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
        error: "USER_NOT_FOUND",
      });
    }

    const salt = await bcrypt.genSalt(12);
    usuario.password = await bcrypt.hash(passwordNueva, salt);
    usuario.passwordResetBlockedUntil = null; // limpia el bloqueo si existía
    await usuario.save();

    return res.status(200).json({
      success: true,
      message: "¡Contraseña actualizada exitosamente! Ya puedes iniciar sesión.",
    });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Error al cambiar la contraseña.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};