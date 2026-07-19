/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: notificaciones.js
 * UBICACIÓN: /backend/routes/notificaciones.js
 * DESCRIPCIÓN: Rutas de gestión de notificaciones para admin
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CAMBIOS:
 * ✅ Eliminados todos los console.log innecesarios
 * ✅ Eliminados los console.log de depuración del rechazo
 * ✅ Respuestas consistentes
 */

import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { esAdmin } from "../middlewares/roleMiddleware.js";
import Notificacion from "../models/Notificacion.js";
import Usuario from "../models/Usuario.js";
import Log from "../models/Log.js";

const router = express.Router();

const isProduction = process.env.NODE_ENV === "production";

// ── GET /api/notificaciones ──────────────────────────────────────────
router.get("/", verifyToken, esAdmin, async (req, res) => {
  try {
    const notificaciones = await Notificacion.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: notificaciones });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al obtener notificaciones" });
  }
});

// ── GET /api/notificaciones/no-leidas ────────────────────────────────
router.get("/no-leidas", verifyToken, esAdmin, async (req, res) => {
  try {
    const notificaciones = await Notificacion.find({
      visible: true,
      procesada: false,
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: notificaciones });
  } catch (error) {
    console.error("Error al obtener notificaciones no leídas:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al obtener notificaciones" });
  }
});

// ── PATCH /api/notificaciones/:id/leer ──────────────────────────────
router.patch("/:id/leer", verifyToken, esAdmin, async (req, res) => {
  try {
    const notificacion = await Notificacion.findByIdAndUpdate(
      req.params.id,
      { visible: false },
      { new: true },
    );
    if (!notificacion) {
      return res
        .status(404)
        .json({ success: false, message: "Notificación no encontrada" });
    }
    res.json({ success: true, data: notificacion });
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al marcar notificación" });
  }
});

// ── POST /api/notificaciones/:id/aprobar ────────────────────────────
router.post("/:id/aprobar", verifyToken, esAdmin, async (req, res) => {
  try {
    const { idUsuario } = req.body;

    if (!idUsuario) {
      return res
        .status(400)
        .json({ success: false, message: "ID de usuario requerido" });
    }

    const usuario = await Usuario.findByIdAndUpdate(
      idUsuario,
      {
        estado: "activo",
        activo: true,
        fechaAprobacion: new Date(),
        aprobadoPor: req.user.id,
      },
      { new: true },
    );

    if (!usuario) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    await Notificacion.findByIdAndUpdate(req.params.id, {
      procesada: true,
      visible: false,
    });

    res.json({
      success: true,
      message: `Usuario ${usuario.nombre} aprobado exitosamente`,
      data: usuario,
    });
  } catch (error) {
    console.error("Error al aprobar usuario:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al aprobar usuario" });
  }
});

// ── PUT /api/notificaciones/:id/rechazar ────────────────────────────
router.put("/:id/rechazar", verifyToken, esAdmin, async (req, res) => {
  try {
    const { idUsuario } = req.body;

    if (!idUsuario) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario no proporcionado",
        error: "MISSING_USER_ID",
      });
    }

    const usuario = await Usuario.findById(idUsuario);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
        error: "USER_NOT_FOUND",
      });
    }

    const datosUsuario = {
      id: usuario._id.toString(),
      nombre: usuario.nombre,
      cedula: usuario.cedula,
      email: usuario.email,
      rol: usuario.rol,
    };

    await Usuario.findByIdAndDelete(idUsuario);

    // Registrar en log
    try {
      await Log.create({
        accion: "rechazar_usuario_notificacion",
        tipoUsuario: "admin",
        idUsuario: req.user?._id || req.user?.id,
        detalles: {
          usuarioRechazado: datosUsuario,
          viaNotificacion: true,
          fechaRechazo: new Date(),
        },
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        resultado: "exito",
        severidad: "warning",
      });
    } catch {
      // No fallar si el log falla
    }

    // Eliminar notificaciones del usuario
    await Notificacion.deleteMany({ idUsuario }).catch(() => {});

    return res.json({
      success: true,
      message: `Usuario ${datosUsuario.nombre} rechazado y eliminado del sistema`,
      data: { usuarioEliminado: datosUsuario },
    });
  } catch (error) {
    console.error("Error al rechazar usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error al rechazar usuario",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
});

console.log("[NOTIF] Rutas de notificaciones cargadas:");
console.log("  - GET    /api/notificaciones");
console.log("  - GET    /api/notificaciones/no-leidas");
console.log("  - PATCH  /api/notificaciones/:id/leer");
console.log("  - POST   /api/notificaciones/:id/aprobar");
console.log("  - PUT    /api/notificaciones/:id/rechazar"); 

export default router;
