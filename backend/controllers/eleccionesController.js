/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: eleccionesController.js
 * UBICACIÓN: /backend/controllers/eleccionesController.js
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CAMBIOS:
 * ✅ Eliminado console.error
 * ✅ Respuestas consistentes { success, message, data }
 * ✅ Verificación de existencia antes de actualizar/eliminar
 * ✅ Eliminado código comentado (versión anterior de createEleccion)
 */

import Eleccion from "../models/Eleccion.js";
import Voto from "../models/Voto.js";

const isProduction = process.env.NODE_ENV === "production";

export const createEleccion = async (req, res) => {
  try {
    const { titulo, descripcion, idTipoEleccion } = req.body;

    if (!titulo || !idTipoEleccion) {
      return res.status(400).json({
        success: false,
        message: "Título y tipo de elección son obligatorios.",
        error: "MISSING_FIELDS",
      });
    }

    const existeTitulo = await Eleccion.findOne({
      titulo: { $regex: new RegExp(`^${titulo.trim()}$`, "i") },
    });
    if (existeTitulo) {
      return res.status(400).json({
        success: false,
        message: `Ya existe una elección con el título "${titulo}".`,
        error: "TITULO_EXISTS",
      });
    }

    const nuevaEleccion = new Eleccion(req.body);
    const saved = await nuevaEleccion.save();

    return res.status(201).json({
      success: true,
      message: "Elección creada exitosamente.",
      data: saved,
    });
  } catch (error) {
    console.error('Error en createEleccion:', error);
    return res.status(500).json({
      success: false,
      message: "Error al crear elección.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

// export const updateEleccion = async (req, res) => {
//   try {
//     const eleccion = await Eleccion.findByIdAndUpdate(
//       req.params.id,
//       { $set: req.body },
//       { new: true, runValidators: true },
//     ).populate("idTipoEleccion", "nombre");

//     if (!eleccion) {
//       return res
//         .status(404)
//         .json({
//           success: false,
//           message: "Elección no encontrada",
//           error: "NOT_FOUND",
//         });
//     }

//     return res
//       .status(200)
//       .json({
//         success: true,
//         message: "Elección actualizada correctamente.",
//         data: eleccion,
//       });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error al actualizar elección.",
//       error: isProduction ? "SERVER_ERROR" : error.message,
//     });
//   }
// };

export const updateEleccion = async (req, res) => {
  try {
    console.log("UPDATE ELECCION ID:", req.params.id);
    console.log("BODY recibido:", JSON.stringify(req.body, null, 2));

    const eleccion = await Eleccion.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: false },
    ).populate("idTipoEleccion", "nombre");

    console.log("Resultado:", eleccion);

    if (!eleccion) {
      return res.status(404).json({
        success: false,
        message: "Elección no encontrada",
        error: "NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Elección actualizada correctamente.",
      data: eleccion,
    });
  } catch (error) {
    console.error("ERROR en updateEleccion:", error.message);
    console.error("STACK:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar elección.",
      error: error.message,
    });
  }
};

export const getElecciones = async (req, res) => {
  try {
    const elecciones = await Eleccion.find()
      .populate("idTipoEleccion", "nombre activa")
      .sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ success: true, total: elecciones.length, data: elecciones });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener elecciones.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const getEleccionesActivas = async (req, res) => {
  try {
    const hoy = new Date();
    const elecciones = await Eleccion.find({
      activa: true,
      fechaInicio: { $lte: hoy },
      fechaFin: { $gte: hoy },
    }).populate("idTipoEleccion", "nombre");
    return res
      .status(200)
      .json({ success: true, total: elecciones.length, data: elecciones });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener elecciones activas.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const getEleccionById = async (req, res) => {
  try {
    const eleccion = await Eleccion.findById(req.params.id).populate(
      "idTipoEleccion",
      "nombre",
    );
    if (!eleccion) {
      return res.status(404).json({
        success: false,
        message: "Elección no encontrada",
        error: "NOT_FOUND",
      });
    }
    return res.status(200).json({ success: true, data: eleccion });
  } catch (error) {
    console.error("Error en getEleccionById:", error); 
    return res.status(500).json({
      success: false,
      message: "Error al obtener elección.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const deleteEleccion = async (req, res) => {
  try {
    const eleccion = await Eleccion.findById(req.params.id);
    if (!eleccion) {
      return res.status(404).json({
        success: false,
        message: "Elección no encontrada",
        error: "NOT_FOUND",
      });
    }

    const votosCount = await Voto.countDocuments({ idEleccion: req.params.id });
    if (votosCount > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar. La elección tiene ${votosCount} voto(s) registrado(s).`,
        error: "HAS_VOTES",
      });
    }

    await Eleccion.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ success: true, message: "Elección eliminada correctamente." });
  } catch (error) {
    console.error("ERROR en deleteEleccion:", error.message);
    console.error("STACK:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar elección.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const desactivarEleccion = async (req, res) => {
  try {
    const eleccion = await Eleccion.findByIdAndUpdate(
      req.params.id,
      { activa: false },
      { new: true },
    );
    if (!eleccion) {
      return res.status(404).json({
        success: false,
        message: "Elección no encontrada",
        error: "NOT_FOUND",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Elección desactivada correctamente.",
      data: eleccion,
    });
  } catch (error) {
    console.error("ERROR en desactivarEleccion:", error.message);
    console.error("STACK:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Error al desactivar elección.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const getEleccionesCiudadano = async (req, res) => {
  try {
    const idCiudadano = req.user._id;
    const hoy = new Date();

      // Log temporal para ver la estructura
    // const votoEjemplo = await Voto.findOne();
    // console.log("ESTRUCTURA VOTO:", votoEjemplo);
    // Elecciones activas
    const activas = await Eleccion.find({
      activa: true,
      fechaInicio: { $lte: hoy },
      fechaFin: { $gte: hoy },
    }).populate("idTipoEleccion", "nombre");

    // Elecciones donde ya votó (aunque hayan finalizado)
    const votos = await Voto.find({ idCiudadano }).select("idEleccion");
    const idsVotadas = votos.map((v) => v.idEleccion.toString());

    const votadas = await Eleccion.find({
      _id: { $in: idsVotadas },
      activa: { $in: [true, false] },
    }).populate("idTipoEleccion", "nombre");

    // Combinar sin duplicados
    const mapaElecciones = new Map();
    [...activas, ...votadas].forEach((e) => mapaElecciones.set(e._id.toString(), e));
    const data = Array.from(mapaElecciones.values());

    return res.status(200).json({ success: true, total: data.length, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener elecciones del ciudadano.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export default {
  createEleccion,
  updateEleccion,
  getElecciones,
  getEleccionesCiudadano,
  getEleccionesActivas,
  getEleccionById,
  deleteEleccion,
  desactivarEleccion,
};