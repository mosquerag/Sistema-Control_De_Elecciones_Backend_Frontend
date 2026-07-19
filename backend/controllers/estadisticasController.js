/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: estadisticasController.js
 * UBICACIÓN: /backend/controllers/estadisticasController.js
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CAMBIOS:
 * ✅ Respuestas consistentes { success, message, data }
 * ✅ Manejo seguro de división por cero en porcentajes
 * ✅ isProduction para mensajes de error
 */

// import Voto from "../models/Voto.js";
// import Usuario from "../models/Usuario.js";
// import Eleccion from "../models/Eleccion.js";
// import mongoose from "mongoose";

import Voto from "../models/Voto.js";
import VotoAnonimo from "../models/VotoAnonimo.js";
import Usuario from "../models/Usuario.js";
import Eleccion from "../models/Eleccion.js";
import mongoose from "mongoose";

const isProduction = process.env.NODE_ENV === "production";

export const getResultadosEleccion = async (req, res) => {
  try {
    const { idEleccion } = req.params;

    const eleccion = await Eleccion.findById(idEleccion);
    if (!eleccion) {
      return res.status(404).json({
        success: false,
        message: "Elección no encontrada",
        error: "NOT_FOUND",
      });
    }

    // const resultados = await Voto.aggregate([
    //   { $match: { idEleccion: eleccion._id } },
    //   { $group: { _id: "$idCandidato", totalVotos: { $sum: 1 } } },
    //   { $sort: { totalVotos: -1 } },
    // ]);

    const resultados = await VotoAnonimo.aggregate([
      { $match: { idEleccion: eleccion._id } },
      { $group: { _id: "$idCandidato", totalVotos: { $sum: 1 } } },
      { $sort: { totalVotos: -1 } },
    ]);

    const totalVotantes = eleccion.totalVotantes || 0;

    const resultadosConCandidatos = await Promise.all(
      resultados.map(async (r) => {
        const candidato = await Usuario.findById(
          r._id,
          "nombre partido fotoPerfil",
        );
        const porcentaje =
          totalVotantes > 0
            ? parseFloat(((r.totalVotos / totalVotantes) * 100).toFixed(2))
            : 0;
        return { candidato, votos: r.totalVotos, porcentaje };
      }),
    );

    return res.status(200).json({
      success: true,
      data: {
        eleccion: { titulo: eleccion.titulo, totalVotantes },
        resultados: resultadosConCandidatos,
      },
    });
  } catch (error) {
    console.error("Error en getResultadosEleccion:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener resultados de la elección.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

// export const getResultadosCandidato = async (req, res) => {
//   try {
//     const idCandidato = req.user._id;

//     const candidato =
//       await Usuario.findById(idCandidato).populate("idEleccion");
//     if (!candidato || candidato.rol !== "candidato") {
//       return res
//         .status(403)
//         .json({ success: false, message: "No autorizado", error: "FORBIDDEN" });
//     }

//     const totalVotos = await Voto.countDocuments({ idCandidato });

//     const eleccion = await Eleccion.findById(candidato.idEleccion);
//     if (!eleccion) {
//       return res.status(404).json({
//         success: false,
//         message: "Elección no encontrada",
//         error: "NOT_FOUND",
//       });
//     }

//     const porcentaje =
//       eleccion.totalVotantes > 0
//         ? parseFloat(((totalVotos / eleccion.totalVotantes) * 100).toFixed(2))
//         : 0;

//     const todosLosCandidatos = await Usuario.find({
//       rol: "candidato",
//       idEleccion: candidato.idEleccion,
//     }).sort({ totalVotos: -1 });

//     const posicion =
//       todosLosCandidatos.findIndex((c) => c._id.equals(idCandidato)) + 1;

//     return res.status(200).json({
//       success: true,
//       data: {
//         candidato: {
//           nombre: candidato.nombre,
//           partido: candidato.partido,
//           fotoPerfil: candidato.fotoPerfil,
//         },
//         eleccion: {
//           titulo: eleccion.titulo,
//           totalVotantes: eleccion.totalVotantes,
//         },
//         misResultados: { votos: totalVotos, porcentaje, posicion },
//       },
//     });
//   } catch (error) {
//     console.error("Error en getResultadosCandidato:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error al obtener resultados del candidato.",
//       error: isProduction ? "SERVER_ERROR" : error.message,
//     });
//   }
// };

// export const getResultadosCandidato = async (req, res) => {
//   try {
//     const idCandidato = req.user._id;

//     const candidato =
//       await Usuario.findById(idCandidato).populate("idEleccion");
//     if (!candidato || candidato.rol !== "candidato") {
//       return res.status(403).json({
//         success: false,
//         message: "No autorizado",
//         error: "FORBIDDEN",
//       });
//     }

//     const totalVotos = await Voto.countDocuments({ idCandidato });

//     const eleccion = await Eleccion.findById(candidato.idEleccion);
//     if (!eleccion) {
//       return res.status(404).json({
//         success: false,
//         message: "Elección no encontrada",
//         error: "NOT_FOUND",
//       });
//     }

//     const porcentaje =
//       eleccion.totalVotantes > 0
//         ? parseFloat(((totalVotos / eleccion.totalVotantes) * 100).toFixed(2))
//         : 0;

//     const todosLosCandidatos = await Usuario.find({
//       rol: "candidato",
//       idEleccion: candidato.idEleccion,
//     }).sort({ totalVotos: -1 });

//     const posicion =
//       todosLosCandidatos.findIndex((c) => c._id.equals(idCandidato)) + 1;

//     return res.status(200).json({
//       success: true,
//       data: {
//         candidato: {
//           _id: candidato._id, // ← agregado
//           nombre: candidato.nombre,
//           partido: candidato.partido,
//           fotoPerfil: candidato.fotoPerfil,
//         },
//         eleccion: {
//           _id: eleccion._id, // ← agregado
//           titulo: eleccion.titulo,
//           totalVotantes: eleccion.totalVotantes,
//         },
//         misResultados: { votos: totalVotos, porcentaje, posicion },
//       },
//     });
//   } catch (error) {
//     console.error("Error en getResultadosCandidato:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error al obtener resultados del candidato.",
//       error: isProduction ? "SERVER_ERROR" : error.message,
//     });
//   }
// };

export const getResultadosCandidato = async (req, res) => {
  try {
    const idCandidato = req.user._id;

    const candidato = await Usuario.findById(idCandidato).populate("idEleccion");
    if (!candidato || candidato.rol !== "candidato") {
      return res.status(403).json({
        success: false,
        message: "No autorizado",
        error: "FORBIDDEN",
      });
    }

    // const totalVotos = await Voto.countDocuments({ idCandidato });
    const totalVotos = await VotoAnonimo.countDocuments({ idCandidato });

    const eleccion = await Eleccion.findById(candidato.idEleccion);
    if (!eleccion) {
      return res.status(404).json({
        success: false,
        message: "Elección no encontrada",
        error: "NOT_FOUND",
      });
    }

    const porcentaje =
      eleccion.totalVotantes > 0
        ? parseFloat(((totalVotos / eleccion.totalVotantes) * 100).toFixed(2))
        : 0;

    const todosLosCandidatos = await Usuario.find({
      rol: "candidato",
      idEleccion: candidato.idEleccion,
    }).sort({ totalVotos: -1 });

    const posicion =
      todosLosCandidatos.findIndex((c) => c._id.equals(idCandidato)) + 1;

    // const resultadosAgregados = await Voto.aggregate([
    //   { $match: { idEleccion: eleccion._id } },
    //   { $group: { _id: "$idCandidato", totalVotos: { $sum: 1 } } },
    //   { $sort: { totalVotos: -1 } },
    // ]);

    const resultadosAgregados = await VotoAnonimo.aggregate([
      { $match: { idEleccion: eleccion._id } },
      { $group: { _id: "$idCandidato", totalVotos: { $sum: 1 } } },
      { $sort: { totalVotos: -1 } },
    ]);

    const resultados = await Promise.all(
      resultadosAgregados.map(async (r) => {
        const cand = await Usuario.findById(r._id, "nombre partido fotoPerfil");
        const pct =
          eleccion.totalVotantes > 0
            ? parseFloat(((r.totalVotos / eleccion.totalVotantes) * 100).toFixed(2))
            : 0;
        return { candidato: cand, votos: r.totalVotos, porcentaje: pct };
      }),
    );

    return res.status(200).json({
      success: true,
      data: {
        candidato: {
          _id: candidato._id,
          nombre: candidato.nombre,
          partido: candidato.partido,
          fotoPerfil: candidato.fotoPerfil,
        },
        eleccion: {
          _id: eleccion._id,
          titulo: eleccion.titulo,
          totalVotantes: eleccion.totalVotantes,
        },
        misResultados: { votos: totalVotos, porcentaje, posicion },
        resultados,
      },
    });
  } catch (error) {
    console.error("Error en getResultadosCandidato:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener resultados del candidato.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const getEvolucionVotos = async (req, res) => {
  try {
    const { idCandidato } = req.params;

    // Solo el mismo candidato o un admin puede ver la evolución
    if (
      req.user.rol === "candidato" &&
      req.user._id.toString() !== idCandidato
    ) {
      return res
        .status(403)
        .json({ success: false, message: "No autorizado", error: "FORBIDDEN" });
    }

    // const evolucion = await Voto.aggregate([
    //   { $match: { idCandidato: new mongoose.Types.ObjectId(idCandidato) } },
    const evolucion = await VotoAnonimo.aggregate([
      { $match: { idCandidato: new mongoose.Types.ObjectId(idCandidato) } },
      {
        $group: {
          _id: {
            year: { $year: "$fechaVoto" },
            month: { $month: "$fechaVoto" },
            day: { $dayOfMonth: "$fechaVoto" },
            hour: { $hour: "$fechaVoto" },
          },
          votosPorHora: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } },
    ]);

    return res.status(200).json({ success: true, data: evolucion });
  } catch (error) {
    console.error("Error en getEvolucionVotos:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener evolución de votos.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const getParticipacionEleccion = async (req, res) => {
  try {
    const { idEleccion } = req.params;
    const eleccion = await Eleccion.findById(idEleccion);
    if (!eleccion) {
      return res.status(404).json({
        success: false,
        message: "Elección no encontrada",
        error: "NOT_FOUND",
      });
    }
    const totalVotos = await Voto.countDocuments({ idEleccion });
    const porcentajeParticipacion =
      eleccion.totalVotantes > 0
        ? parseFloat(((totalVotos / eleccion.totalVotantes) * 100).toFixed(2))
        : 0;
    return res.status(200).json({
      success: true,
      data: {
        eleccion: {
          titulo: eleccion.titulo,
          totalVotantes: eleccion.totalVotantes,
        },
        participacion: { totalVotos, porcentaje: porcentajeParticipacion },
      },
    });
  } catch (error) {
    console.error("Error en getParticipacionEleccion:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener participación de la elección.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export default {
  getResultadosEleccion,
  getResultadosCandidato,
  getEvolucionVotos,
  getParticipacionEleccion,
};
