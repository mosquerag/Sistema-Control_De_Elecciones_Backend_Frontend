/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: elecciones.js
 * UBICACIÓN: /backend/routes/elecciones.js
 * DESCRIPCIÓN: Rutas CRUD de elecciones
 * ═══════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import {
  createEleccion,
  updateEleccion,
  getElecciones,
  getEleccionesActivas,
  getEleccionById,
  deleteEleccion,
  desactivarEleccion,
  getEleccionesCiudadano,
} from '../controllers/eleccionesController.js';
import { verifyToken, verifyAdmin } from '../middlewares/verifyToken.js';
import { normalizarFechasEleccion } from '../middlewares/normalizarFechas.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════
// RUTAS PÚBLICAS/AUTENTICADAS
// ═══════════════════════════════════════════════════════════════════════

/**
 * @route GET /api/elecciones
 * @description Obtener todas las elecciones
 * @access Público
 */
router.get('/', getElecciones);

/**
 * @route GET /api/elecciones/activas
 * @description Obtener solo elecciones activas
 * @access Público
 */
router.get('/activas', getEleccionesActivas);

router.get('/ciudadano', verifyToken, getEleccionesCiudadano);

/**
 * @route GET /api/elecciones/:id
 * @description Obtener elección por ID
 * @access Público
 */
router.get('/:id', getEleccionById);

// ═══════════════════════════════════════════════════════════════════════
// RUTAS SOLO ADMIN
// ═══════════════════════════════════════════════════════════════════════

/**
 * @route POST /api/elecciones
 * @description Crear nueva elección
 * @access Privado (solo admin)
 */
router.post('/', verifyToken, verifyAdmin, normalizarFechasEleccion, createEleccion);

/**
 * @route PUT /api/elecciones/:id
 * @description Actualizar elección
 * @access Privado (solo admin)
 */
router.put('/:id', verifyToken, verifyAdmin, normalizarFechasEleccion, updateEleccion);

/**
 * @route PATCH /api/elecciones/:id/desactivar
 * @description Desactivar elección
 * @access Privado (solo admin)
 */
router.patch('/:id/desactivar', verifyToken, verifyAdmin, desactivarEleccion);

/**
 * @route DELETE /api/elecciones/:id
 * @description Eliminar elección (solo si no tiene votos)
 * @access Privado (solo admin)
 */
router.delete('/:id', verifyToken, verifyAdmin, deleteEleccion);



// ═══════════════════════════════════════════════════════════════════════
// EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════

export default router;