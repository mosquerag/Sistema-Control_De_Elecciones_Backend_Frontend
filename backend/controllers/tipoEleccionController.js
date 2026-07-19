/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: tipoEleccionController.js
 * UBICACIÓN: /backend/controllers/tipoEleccionController.js
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CAMBIOS:
 * ✅ Eliminado console.error
 * ✅ Respuestas consistentes { success, message, data }
 * ✅ Eliminado código comentado (versión anterior de createTipoEleccion)
 */

import TipoEleccion from "../models/TipoEleccion.js";

const isProduction = process.env.NODE_ENV === "production";

export const createTipoEleccion = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre es obligatorio.",
        error: "MISSING_FIELDS",
      });
    }

    const existeNombre = await TipoEleccion.findOne({
      nombre: { $regex: new RegExp(`^${nombre.trim()}$`, "i") },
    });
    if (existeNombre) {
      return res.status(400).json({
        success: false,
        message: `El tipo de elección "${nombre}" ya está registrado.`,
        error: "NOMBRE_EXISTS",
      });
    }

    const nuevo = new TipoEleccion({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim(),
    });
    const saved = await nuevo.save();

    return res.status(201).json({
      success: true,
      message: "Tipo de elección creado exitosamente.",
      data: saved,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al crear tipo de elección.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const getTiposEleccion = async (req, res) => {
  try {
    const tipos = await TipoEleccion.find().sort({ nombre: 1 });
    return res
      .status(200)
      .json({ success: true, total: tipos.length, data: tipos });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener tipos de elección.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const getTipoEleccionById = async (req, res) => {
  try {
    const tipo = await TipoEleccion.findById(req.params.id);
    if (!tipo) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Tipo de elección no encontrado",
          error: "NOT_FOUND",
        });
    }
    return res.status(200).json({ success: true, data: tipo });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener tipo de elección.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const updateTipoEleccion = async (req, res) => {
  try {
    const tipo = await TipoEleccion.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!tipo) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Tipo de elección no encontrado",
          error: "NOT_FOUND",
        });
    }
    return res
      .status(200)
      .json({
        success: true,
        message: "Tipo actualizado correctamente.",
        data: tipo,
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al actualizar tipo de elección.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const deleteTipoEleccion = async (req, res) => {
  try {
    const tipo = await TipoEleccion.findByIdAndDelete(req.params.id);
    if (!tipo) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Tipo de elección no encontrado",
          error: "NOT_FOUND",
        });
    }
    return res
      .status(200)
      .json({
        success: true,
        message: "Tipo de elección eliminado correctamente.",
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al eliminar tipo de elección.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const desactivarTipoEleccion = async (req, res) => {
  try {
    const tipo = await TipoEleccion.findByIdAndUpdate(
      req.params.id,
      { activa: false },
      { new: true },
    );
    if (!tipo) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Tipo de elección no encontrado",
          error: "NOT_FOUND",
        });
    }
    return res
      .status(200)
      .json({
        success: true,
        message: "Tipo de elección desactivado correctamente.",
        data: tipo,
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al desactivar tipo de elección.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export default {
  createTipoEleccion,
  getTiposEleccion,
  getTipoEleccionById,
  updateTipoEleccion,
  deleteTipoEleccion,
  desactivarTipoEleccion,
};