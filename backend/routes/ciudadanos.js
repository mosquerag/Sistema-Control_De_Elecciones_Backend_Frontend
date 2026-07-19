/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: ciudadanos.js
 * UBICACIÓN: /backend/routes/ciudadanos.js
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CAMBIOS:
 * ✅ Eliminados todos los console.log
 */

import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { esAdmin } from "../middlewares/roleMiddleware.js";
import Usuario from "../models/Usuario.js";

const router = express.Router();

// GET /api/ciudadanos — Todos los ciudadanos
router.get("/", verifyToken, esAdmin, async (req, res) => {
  try {
    const ciudadanos = await Usuario.find({ rol: "ciudadano" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, total: ciudadanos.length, data: ciudadanos });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Error al obtener ciudadanos" });
  }
});

// GET /api/ciudadanos/activos
router.get("/activos", verifyToken, esAdmin, async (req, res) => {
  try {
    const ciudadanos = await Usuario.find({
      rol: "ciudadano",
      estado: "activo",
      activo: true,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, total: ciudadanos.length, data: ciudadanos });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Error al obtener ciudadanos activos" });
  }
});

// GET /api/ciudadanos/pendientes
router.get("/pendientes", verifyToken, esAdmin, async (req, res) => {
  try {
    const ciudadanos = await Usuario.find({
      rol: "ciudadano",
      estado: "pendiente_aprobacion",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, total: ciudadanos.length, data: ciudadanos });
  } catch {
    res.status(500).json({
      success: false,
      message: "Error al obtener ciudadanos pendientes",
    });
  }
});

// GET /api/ciudadanos/:id
router.get("/:id", verifyToken, esAdmin, async (req, res) => {
  try {
    const ciudadano = await Usuario.findOne({
      _id: req.params.id,
      rol: "ciudadano",
    }).select("-password");

    if (!ciudadano) {
      return res
        .status(404)
        .json({ success: false, message: "Ciudadano no encontrado" });
    }

    res.json({ success: true, data: ciudadano });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Error al obtener ciudadano" });
  }
});

export default router;
