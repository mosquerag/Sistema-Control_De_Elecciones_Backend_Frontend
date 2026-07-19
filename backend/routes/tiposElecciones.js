/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: tiposElecciones.js
 * UBICACIÓN: /backend/routes/tiposElecciones.js
 * DESCRIPCIÓN: Rutas CRUD de tipos de elección
 * ═══════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import {
  createTipoEleccion,
  getTiposEleccion,
  getTipoEleccionById,
  updateTipoEleccion,
  deleteTipoEleccion,
  desactivarTipoEleccion,
} from '../controllers/tipoEleccionController.js';
import { verifyToken, verifyAdmin } from '../middlewares/verifyToken.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════
// RUTAS PÚBLICAS
// ═══════════════════════════════════════════════════════════════════════

/**
 * @route GET /api/tipos-elecciones
 * @description Obtener todos los tipos de elección
 * @access Público
 */
router.get('/', getTiposEleccion);

/**
 * @route GET /api/tipos-elecciones/:id
 * @description Obtener tipo de elección por ID
 * @access Público
 */
router.get('/:id', getTipoEleccionById);

// ═══════════════════════════════════════════════════════════════════════
// RUTAS SOLO ADMIN
// ═══════════════════════════════════════════════════════════════════════

/**
 * @route POST /api/tipos-elecciones
 * @description Crear nuevo tipo de elección
 * @access Privado (solo admin)
 */
router.post('/', verifyToken, verifyAdmin, createTipoEleccion);

/**
 * @route PUT /api/tipos-elecciones/:id
 * @description Actualizar tipo de elección
 * @access Privado (solo admin)
 */
router.put('/:id', verifyToken, verifyAdmin, updateTipoEleccion);

/**
 * @route PATCH /api/tipos-elecciones/:id/desactivar
 * @description Desactivar tipo de elección
 * @access Privado (solo admin)
 */
router.patch('/:id/desactivar', verifyToken, verifyAdmin, desactivarTipoEleccion);

/**
 * @route DELETE /api/tipos-elecciones/:id
 * @description Eliminar tipo de elección
 * @access Privado (solo admin)
 */
router.delete('/:id', verifyToken, verifyAdmin, deleteTipoEleccion);

// ═══════════════════════════════════════════════════════════════════════
// EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════

export default router;