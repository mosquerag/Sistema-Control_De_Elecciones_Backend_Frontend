/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: encuestas.js
 * UBICACIÓN: /backend/routes/encuestas.js
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CAMBIOS:
 * ✅ Eliminados todos los console.log
 */

import express from "express";
import Encuesta from "../models/Encuesta.js";

const router = express.Router();

const RESPUESTAS_VALIDAS = [
  "Muy satisfecho con el sistema actual",
  "Satisfecho, pero necesita mejoras",
  "Neutral",
  "Insatisfecho con algunas características",
];

// POST /api/encuestas — Público
router.post("/", async (req, res) => {
  try {
    const { pregunta, respuesta } = req.body;

    if (!RESPUESTAS_VALIDAS.includes(respuesta)) {
      return res.status(400).json({
        success: false,
        message: "Respuesta no válida",
        error: "INVALID_RESPONSE",
      });
    }

    const nuevaEncuesta = new Encuesta({
      pregunta:
        pregunta ||
        "¿Qué tan satisfecho estás con los sistemas de votación digital actuales?",
      respuesta,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await nuevaEncuesta.save();

    res.status(201).json({
      success: true,
      message: "Respuesta registrada exitosamente",
      data: { id: nuevaEncuesta._id, respuesta: nuevaEncuesta.respuesta },
    });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Error al registrar respuesta" });
  }
});

// GET /api/encuestas/resultados — Público
router.get("/resultados", async (req, res) => {
  try {
    const resultados = await Encuesta.aggregate([
      { $group: { _id: "$respuesta", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const total = await Encuesta.countDocuments();

    const resultadosConPorcentaje = resultados.map((r) => ({
      respuesta: r._id,
      votos: r.count,
      porcentaje: total > 0 ? Math.round((r.count / total) * 100) : 0,
    }));

    res.json({
      success: true,
      data: { total, resultados: resultadosConPorcentaje },
    });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Error al obtener resultados" });
  }
});

export default router;
