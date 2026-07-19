/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: candidatosController.js
 * UBICACIÓN: /backend/controllers/candidatosController.js
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CAMBIOS:
 * ✅ Eliminados todos los console.log/error
 * ✅ Respuestas consistentes con { success, message, data }
 * ✅ Verificación de existencia antes de actualizar/eliminar
 * ✅ No permite modificar totalVotos manualmente
 */

import Usuario from "../models/Usuario.js";
import Voto from "../models/Voto.js";

const isProduction = process.env.NODE_ENV === "production";

export const getCandidatos = async (req, res) => {
  try {
    const candidatos = await Usuario.find({ rol: "candidato", activo: true })
      .populate("idEleccion", "titulo estado")
      .select("-password");
    res.json({ success: true, total: candidatos.length, data: candidatos });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener candidatos",
        error: isProduction ? "SERVER_ERROR" : error.message,
      });
  }
};

export const getCandidatosByEleccion = async (req, res) => {
  try {
    const candidatos = await Usuario.find({
      rol: "candidato",
      idEleccion: req.params.idEleccion,
      activo: true,
    }).select("nombre partido propuestas fotoPerfil totalVotos cedula");
    res.json({ success: true, total: candidatos.length, data: candidatos });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener candidatos",
        error: isProduction ? "SERVER_ERROR" : error.message,
      });
  }
};

export const getCandidatoById = async (req, res) => {
  try {
    const candidato = await Usuario.findOne({
      _id: req.params.id,
      rol: "candidato",
    })
      .populate("idEleccion", "titulo estado fechaInicio fechaFin")
      .select("-password");

    if (!candidato) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Candidato no encontrado",
          error: "NOT_FOUND",
        });
    }

    res.json({ success: true, data: candidato });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al obtener candidato",
        error: isProduction ? "SERVER_ERROR" : error.message,
      });
  }
};

export const updateCandidato = async (req, res) => {
  try {
    // No permitir cambiar votos manualmente
    delete req.body.totalVotos;
    delete req.body.rol;
    delete req.body.password;

    const candidato = await Usuario.findOneAndUpdate(
      { _id: req.params.id, rol: "candidato" },
      { $set: req.body },
      { new: true, runValidators: true },
    )
      .populate("idEleccion", "titulo")
      .select("-password");

    if (!candidato) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Candidato no encontrado",
          error: "NOT_FOUND",
        });
    }

    res.json({
      success: true,
      message: "Candidato actualizado correctamente",
      data: candidato,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al actualizar candidato",
        error: isProduction ? "SERVER_ERROR" : error.message,
      });
  }
};

export const deleteCandidato = async (req, res) => {
  try {
    const candidato = await Usuario.findOne({
      _id: req.params.id,
      rol: "candidato",
    });

    if (!candidato) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Candidato no encontrado",
          error: "NOT_FOUND",
        });
    }

    if (candidato.totalVotos > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar. El candidato tiene ${candidato.totalVotos} votos registrados.`,
        error: "HAS_VOTES",
      });
    }

    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Candidato eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al eliminar candidato",
        error: isProduction ? "SERVER_ERROR" : error.message,
      });
  }
};

export const desactivarCandidato = async (req, res) => {
  try {
    const candidato = await Usuario.findOneAndUpdate(
      { _id: req.params.id, rol: "candidato" },
      { activo: false },
      { new: true },
    ).select("-password");

    if (!candidato) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Candidato no encontrado",
          error: "NOT_FOUND",
        });
    }

    res.json({
      success: true,
      message: "Candidato desactivado correctamente",
      data: candidato,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error al desactivar candidato",
        error: isProduction ? "SERVER_ERROR" : error.message,
      });
  }
};

export default {
  getCandidatos,
  getCandidatosByEleccion,
  getCandidatoById,
  updateCandidato,
  deleteCandidato,
  desactivarCandidato,
};