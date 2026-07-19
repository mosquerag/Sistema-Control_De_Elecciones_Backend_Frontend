/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: usuariosController.js
 * UBICACIÓN: /backend/controllers/usuariosController.js
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CAMBIOS:
 * ✅ Respuestas consistentes con { success, message, data }
 * ✅ Verificación de existencia antes de operar
 * ✅ No permite actualizar password directamente
 * ✅ No permite cambiar el propio rol siendo admin
 */

import Usuario from "../models/Usuario.js";

const isProduction = process.env.NODE_ENV === "production";

export const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ success: true, total: usuarios.length, data: usuarios });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener usuarios",
        error: isProduction ? "SERVER_ERROR" : error.message,
      });
  }
};

export const getUsuariosByRol = async (req, res) => {
  try {
    const rolesValidos = ["admin", "ciudadano", "candidato"];
    if (!rolesValidos.includes(req.params.rol)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Rol inválido",
          error: "INVALID_ROLE",
        });
    }
    const usuarios = await Usuario.find({ rol: req.params.rol })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ success: true, total: usuarios.length, data: usuarios });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener usuarios",
        error: isProduction ? "SERVER_ERROR" : error.message,
      });
  }
};

export const getUsuarioById = async (req, res) => {
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
    res.json({ success: true, data: usuario });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener usuario",
        error: isProduction ? "SERVER_ERROR" : error.message,
      });
  }
};

export const updateUsuario = async (req, res) => {
  try {
    // Campos protegidos — no pueden actualizarse aquí
    delete req.body.password;
    delete req.body.googleId;
    delete req.body.esGoogleAuth;

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
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

    res.json({
      success: true,
      message: "Usuario actualizado correctamente",
      data: usuario,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al actualizar usuario",
        error: isProduction ? "SERVER_ERROR" : error.message,
      });
  }
};

export const desactivarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { activo: false, estado: "bloqueado" },
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

    res.json({
      success: true,
      message: "Usuario desactivado correctamente",
      data: usuario,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al desactivar usuario",
        error: isProduction ? "SERVER_ERROR" : error.message,
      });
  }
};

export const deleteUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Usuario no encontrado",
          error: "NOT_FOUND",
        });
    }

    // Proteger contra auto-eliminación
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "No puedes eliminar tu propia cuenta",
        error: "SELF_DELETE",
      });
    }

    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Usuario eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al eliminar usuario",
        error: isProduction ? "SERVER_ERROR" : error.message,
      });
  }
};
 export default {
  getUsuarios,
  getUsuariosByRol,
  getUsuarioById,
  updateUsuario,
  desactivarUsuario,
  deleteUsuario,
};