/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: approvalController.js
 * UBICACIÓN: /backend/controllers/approvalController.js
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CAMBIOS:
 * ✅ Eliminados todos los console.log (había docenas)
 * ✅ Respuestas consistentes { success, message, data }
 * ✅ isProduction para mensajes de error
 */

import Usuario from "../models/Usuario.js";
import Notificacion from "../models/Notificacion.js";
import Log from "../models/Log.js";

const isProduction = process.env.NODE_ENV === "production";

// ── Listado ───────────────────────────────────────────────────────────

export const obtenerPendientes = async (req, res) => {
  try {
    const { tipo = "todos", page = 1, limit = 20 } = req.query;
    const query = { estado: "pendiente_aprobacion" };

    if (tipo !== "todos") {
      query.rol = tipo;
    } else {
      query.rol = { $in: ["ciudadano", "candidato"] };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [usuarios, total] = await Promise.all([
      Usuario.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Usuario.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: usuarios,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error en obtenerPendientes:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener usuarios pendientes.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const obtenerNotificaciones = async (req, res) => {
  try {
    const { soloNoLeidas } = req.query;
    const query =
      soloNoLeidas === "true" ? { visible: true, procesada: false } : {};

    const notificaciones = await Notificacion.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({ success: true, data: notificaciones });
  } catch (error) {
    console.error("Error en obtenerNotificaciones:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener notificaciones.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const obtenerEstadisticasAprobacion = async (req, res) => {
  try {
    const [pendientes, aprobados, rechazados, bloqueados] = await Promise.all([
      Usuario.countDocuments({
        estado: "pendiente_aprobacion",
        rol: { $in: ["ciudadano", "candidato"] },
      }),
      Usuario.countDocuments({ estado: "activo" }),
      Usuario.countDocuments({ estado: "rechazado" }),
      Usuario.countDocuments({ estado: "bloqueado" }),
    ]);

    return res.status(200).json({
      success: true,
      data: { usuarios: { pendientes, aprobados, rechazados, bloqueados } },
    });
  } catch (error) {
    console.error("Error en obtenerEstadisticasAprobacion:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

// ── Aprobación ────────────────────────────────────────────────────────

export const aprobarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('id aprobando usuario', id)

    const usuario = await Usuario.findByIdAndUpdate(
      id,
      {
        estado: "activo",
        activo: true,
        fechaAprobacion: new Date(),
        aprobadoPor: req.user._id,
        $push: {
          historicoEstados: {
            estado: "activo",
            fecha: new Date(),
            adminId: req.user._id,
          },
        },
      },
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

    // Marcar notificaciones del usuario como procesadas
    await Notificacion.updateMany(
      { idUsuario: id },
      { procesada: true, visible: false },
    );

    return res.status(200).json({
      success: true,
      message: `Usuario ${usuario.nombre} aprobado exitosamente.`,
      data: usuario,
    });
  } catch (error) {
    console.error("❌ Error al aprobar usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error al aprobar usuario.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const rechazarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Rechazando usuario:", id);
    const { motivo = "No especificado" } = req.body;

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Usuario no encontrado",
          error: "NOT_FOUND",
        });
    }

    const datosUsuario = {
      nombre: usuario.nombre,
      cedula: usuario.cedula,
      email: usuario.email,
      rol: usuario.rol,
    };

    await Usuario.findByIdAndDelete(id);
     console.log("Usuario rechazado (soft delete):", datosUsuario.nombre);

    await Notificacion.deleteMany({ idUsuario: id }).catch(() => {});

    try {
      await Log.create({
        accion: "rechazar_usuario",
        tipoUsuario: "admin",
        idUsuario: req.user._id,
        detalles: {
          usuarioRechazado: datosUsuario,
          motivo,
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

    return res.status(200).json({
      success: true,
      message: `Usuario ${datosUsuario.nombre} rechazado y eliminado del sistema.`,
    });
  } catch (error) {
    console.error("Error al rechazar usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error al rechazar usuario.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

// ── Bloqueo ───────────────────────────────────────────────────────────

export const bloquearUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo = "No especificado" } = req.body;

    const usuario = await Usuario.findByIdAndUpdate(
      id,
      {
        estado: "bloqueado",
        activo: false,
        $push: {
          historicoEstados: {
            estado: "bloqueado",
            fecha: new Date(),
            adminId: req.user._id,
          },
        },
      },
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
      message: `Usuario ${usuario.nombre} bloqueado.`,
      data: usuario,
    });
  } catch (error) {
    console.error("Error al bloquear usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error al bloquear usuario.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const desbloquearUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByIdAndUpdate(
      id,
      {
        estado: "activo",
        activo: true,
        $push: {
          historicoEstados: {
            estado: "activo",
            fecha: new Date(),
            adminId: req.user._id,
          },
        },
      },
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
      message: `Usuario ${usuario.nombre} desbloqueado.`,
      data: usuario,
    });
  } catch (error) {
    console.error("Error al desbloquear usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error al desbloquear usuario.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

// ── Notificaciones ────────────────────────────────────────────────────

export const marcarNotificacionLeida = async (req, res) => {
  try {
    const notif = await Notificacion.findByIdAndUpdate(
      req.params.id,
      { visible: false },
      { new: true },
    );
    if (!notif) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Notificación no encontrada",
          error: "NOT_FOUND",
        });
    }
    return res.status(200).json({ success: true, data: notif });
  } catch (error) {
    console.error("Error al marcar notificación:", error);
    return res.status(500).json({
      success: false,
      message: "Error al marcar notificación.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const procesarNotificacion = async (req, res) => {
  try {
    const { accion, motivo = "" } = req.body;
    const notif = await Notificacion.findById(req.params.id);

    if (!notif) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Notificación no encontrada",
          error: "NOT_FOUND",
        });
    }

    const accionesValidas = ["aprobar", "rechazar", "bloquear"];
    if (!accionesValidas.includes(accion)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Acción inválida",
          error: "INVALID_ACTION",
        });
    }

    // Delegar en los controladores correspondientes simulando req/res
    if (accion === "aprobar") {
      req.params.id = notif.idUsuario.toString();
      return aprobarUsuario(req, res);
    }
    if (accion === "rechazar") {
      req.params.id = notif.idUsuario.toString();
      req.body.motivo = motivo;
      return rechazarUsuario(req, res);
    }
    if (accion === "bloquear") {
      req.params.id = notif.idUsuario.toString();
      req.body.motivo = motivo;
      return bloquearUsuario(req, res);
    }
  } catch (error) {
    console.error("Error al procesar notificación:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar notificación.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};


export default {
  obtenerPendientes,
  obtenerNotificaciones,
  aprobarUsuario,
  rechazarUsuario,
  bloquearUsuario,
  desbloquearUsuario,
  marcarNotificacionLeida,
  procesarNotificacion,
  obtenerEstadisticasAprobacion,
};