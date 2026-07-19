/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: approval.js
 * UBICACIÓN: /backend/routes/approval.js
 * DESCRIPCIÓN: Rutas para gestión de aprobación de usuarios y notificaciones
 * ═══════════════════════════════════════════════════════════════════════
 */

import express from 'express';

// Controladores
import {
  obtenerPendientes,
  obtenerNotificaciones,
  aprobarUsuario,
  rechazarUsuario,
  bloquearUsuario,
  desbloquearUsuario,
  marcarNotificacionLeida,
  procesarNotificacion,
  obtenerEstadisticasAprobacion,
} from '../controllers/approvalController.js';

// Middlewares
import { verifyToken, verifyAdmin } from '../middlewares/verifyToken.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════
// MIDDLEWARE GLOBAL: Todas las rutas requieren autenticación de admin
// ═══════════════════════════════════════════════════════════════════════

router.use(verifyToken);
router.use(verifyAdmin);

// ═══════════════════════════════════════════════════════════════════════
// RUTAS DE LISTADO
// ═══════════════════════════════════════════════════════════════════════

/**
 * @route GET /api/approval/pendientes
 * @description Obtiene lista de usuarios pendientes de aprobación
 * @access Privado (solo admins)
 */
router.get('/pendientes', obtenerPendientes);

/**
 * @route GET /api/approval/notificaciones
 * @description Obtiene notificaciones pendientes para administradores
 * @access Privado (solo admins)
 */
router.get('/notificaciones', obtenerNotificaciones);

/**
 * @route GET /api/approval/estadisticas
 * @description Obtiene estadísticas de aprobaciones/rechazos
 * @access Privado (solo admins)
 */
router.get('/estadisticas', obtenerEstadisticasAprobacion);

// ═══════════════════════════════════════════════════════════════════════
// RUTAS DE APROBACIÓN
// ═══════════════════════════════════════════════════════════════════════

/**
 * @route PUT /api/approval/aprobar/:id
 * @description Aprueba un usuario pendiente
 * @access Privado (solo admins)
 */
router.put('/aprobar/:id', aprobarUsuario);

/**
 * @route PUT /api/approval/rechazar/:id
 * @description Rechaza un usuario pendiente
 * @access Privado (solo admins)
 */
router.put('/rechazar/:id', rechazarUsuario);

// ═══════════════════════════════════════════════════════════════════════
// RUTAS DE BLOQUEO
// ═══════════════════════════════════════════════════════════════════════

/**
 * @route PUT /api/approval/bloquear/:id
 * @description Bloquea un usuario
 * @access Privado (solo admins)
 */
router.put('/bloquear/:id', bloquearUsuario);

/**
 * @route PUT /api/approval/desbloquear/:id
 * @description Desbloquea un usuario previamente bloqueado
 * @access Privado (solo admins)
 */
router.put('/desbloquear/:id', desbloquearUsuario);

// ═══════════════════════════════════════════════════════════════════════
// RUTAS DE GESTIÓN DE NOTIFICACIONES
// ═══════════════════════════════════════════════════════════════════════

/**
 * @route PUT /api/approval/notificaciones/:id/leer
 * @description Marca una notificación como leída
 * @access Privado (solo admins)
 */
router.put('/notificaciones/:id/leer', marcarNotificacionLeida);

/**
 * @route POST /api/approval/notificaciones/:id/procesar
 * @description Procesa una notificación (aprobar, rechazar o bloquear)
 * @access Privado (solo admins)
 */
router.post('/notificaciones/:id/procesar', procesarNotificacion);

// ═══════════════════════════════════════════════════════════════════════
// EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════

export default router;