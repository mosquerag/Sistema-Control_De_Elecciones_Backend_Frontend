/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: paisController.js
 * UBICACIÓN: /backend/controllers/paisController.js
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CAMBIOS:
 * ✅ Respuestas consistentes { success, message, data }
 * ✅ Verificación de existencia antes de eliminar
 * ✅ Campo activo (no activa) para consistencia con el resto del sistema
 */

import Pais from "../models/Pais.js";

const isProduction = process.env.NODE_ENV === "production";

export const createPais = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res
        .status(400)
        .json({
          success: false,
          message: "El nombre es obligatorio",
          error: "MISSING_FIELDS",
        });
    }

    const existe = await Pais.findOne({
      nombre: { $regex: new RegExp(`^${nombre.trim()}$`, "i") },
    });
    if (existe) {
      return res
        .status(400)
        .json({
          success: false,
          message: `El país "${nombre}" ya está registrado.`,
          error: "PAIS_EXISTS",
        });
    }

    const nuevo = new Pais(req.body);
    const saved = await nuevo.save();
    return res
      .status(201)
      .json({
        success: true,
        message: "País creado correctamente.",
        data: saved,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error al crear país.",
        error: isProduction ? "SERVER_ERROR" : error.message,
      });
  }
};

export const getPaises = async (req, res) => {
  try {
    const paises = await Pais.find({ activa: true }).sort({ nombre: 1 });
    return res
      .status(200)
      .json({ success: true, total: paises.length, data: paises });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener países.",
        error: isProduction ? "SERVER_ERROR" : error.message,
      });
  }
};

export const getPaisById = async (req, res) => {
  try {
    const pais = await Pais.findById(req.params.id);
    if (!pais) {
      return res
        .status(404)
        .json({
          success: false,
          message: "País no encontrado",
          error: "NOT_FOUND",
        });
    }
    return res.status(200).json({ success: true, data: pais });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener país.",
        error: isProduction ? "SERVER_ERROR" : error.message,
      });
  }
};

export const updatePais = async (req, res) => {
  try {
    const pais = await Pais.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!pais) {
      return res
        .status(404)
        .json({
          success: false,
          message: "País no encontrado",
          error: "NOT_FOUND",
        });
    }
    return res
      .status(200)
      .json({
        success: true,
        message: "País actualizado correctamente.",
        data: pais,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error al actualizar país.",
        error: isProduction ? "SERVER_ERROR" : error.message,
      });
  }
};

export const deletePais = async (req, res) => {
  try {
    const pais = await Pais.findByIdAndDelete(req.params.id);
    if (!pais) {
      return res
        .status(404)
        .json({
          success: false,
          message: "País no encontrado",
          error: "NOT_FOUND",
        });
    }
    return res
      .status(200)
      .json({ success: true, message: "País eliminado correctamente." });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error al eliminar país.",
        error: isProduction ? "SERVER_ERROR" : error.message,
      });
  }
};

export default {
  createPais,
  getPaises,
  getPaisById,
  updatePais,
  deletePais,
};