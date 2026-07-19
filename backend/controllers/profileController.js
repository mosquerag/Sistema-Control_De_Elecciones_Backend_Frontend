/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: profileController.js
 * UBICACIÓN: /backend/controllers/profileController.js
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CAMBIOS:
 * ✅ Eliminados todos los console.log/error
 * ✅ Respuestas consistentes { success, message, data }
 * ✅ isProduction para errores
 * ✅ No expone password en ninguna respuesta
 */

import Usuario from "../models/Usuario.js";
import bcrypt from "bcryptjs";

const isProduction = process.env.NODE_ENV === "production";

export const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user._id).select("-password");
    if (!usuario) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Usuario no encontrado",
          error: "NOT_FOUND",
        });
    }
    return res.status(200).json({ success: true, data: usuario });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener perfil.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const actualizarPerfil = async (req, res) => {
  try {
    // Campos protegidos — no pueden actualizarse desde este endpoint
    const camposProtegidos = [
      "password",
      "rol",
      "estado",
      "activo",
      "googleId",
      "esGoogleAuth",
      "totalVotos",
    ];
    camposProtegidos.forEach((campo) => delete req.body[campo]);

    const usuario = await Usuario.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true, runValidators: true },
    ).select("-password");

    if (!usuario) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Usuario no encontrado",
          error: "NOT_FOUND",
        });
    }

    return res.status(200).json({
      success: true,
      message: "Perfil actualizado correctamente.",
      data: usuario,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al actualizar perfil.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const actualizarFotoPerfil = async (req, res) => {
  try {
    const { fotoPerfil } = req.body;

    if (!fotoPerfil) {
      return res
        .status(400)
        .json({
          success: false,
          message: "La foto de perfil es obligatoria",
          error: "MISSING_PHOTO",
        });
    }

    const esBase64 = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(
      fotoPerfil,
    );
    const esURL = /^https?:\/\/.+/.test(fotoPerfil);
    if (!esBase64 && !esURL) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Formato de imagen inválido",
          error: "INVALID_FORMAT",
        });
    }

    const usuario = await Usuario.findByIdAndUpdate(
      req.user._id,
      { fotoPerfil },
      { new: true },
    ).select("-password");

    if (!usuario) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Usuario no encontrado",
          error: "NOT_FOUND",
        });
    }

    return res.status(200).json({
      success: true,
      message: "Foto de perfil actualizada correctamente.",
      data: { fotoPerfil: usuario.fotoPerfil },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al actualizar foto de perfil.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva, confirmPassword } = req.body;

    if (!passwordActual || !passwordNueva || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos de contraseña son obligatorios.",
        error: "MISSING_FIELDS",
      });
    }

    if (passwordNueva !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Las contraseñas nuevas no coinciden.",
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

    const usuario = await Usuario.findById(req.user._id);
    if (!usuario) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Usuario no encontrado",
          error: "NOT_FOUND",
        });
    }

    if (usuario.esGoogleAuth) {
      return res.status(400).json({
        success: false,
        message:
          "Los usuarios de Google no pueden cambiar su contraseña desde aquí.",
        error: "GOOGLE_AUTH_USER",
      });
    }

    const esCorrecta = await bcrypt.compare(passwordActual, usuario.password);
    if (!esCorrecta) {
      return res.status(400).json({
        success: false,
        message: "La contraseña actual es incorrecta.",
        error: "WRONG_CURRENT_PASSWORD",
      });
    }

    const hashNueva = await bcrypt.hash(passwordNueva, 12);
    await Usuario.findByIdAndUpdate(req.user._id, { password: hashNueva });

    return res.status(200).json({
      success: true,
      message: "Contraseña actualizada correctamente.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al cambiar contraseña.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const obtenerPerfilUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select("-password");
    if (!usuario) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Usuario no encontrado",
          error: "NOT_FOUND",
        });
    }
    return res.status(200).json({ success: true, data: usuario });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener perfil del usuario.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export default {
  obtenerPerfil,
  actualizarPerfil,
  actualizarFotoPerfil,
  cambiarPassword,
  obtenerPerfilUsuario,
};  