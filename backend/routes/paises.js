/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: paises.js
 * UBICACIÓN: /backend/routes/paises.js
 * DESCRIPCIÓN: Rutas CRUD de países
 * ═══════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import {
  createPais,
  getPaises,
  getPaisById,
  updatePais,
  deletePais,
} from '../controllers/paisController.js';
import { verifyToken, verifyAdmin } from '../middlewares/verifyToken.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════
// RUTAS PÚBLICAS
// ═══════════════════════════════════════════════════════════════════════

/**
 * @route GET /api/paises
 * @description Obtener países activos
 * @access Público
 */
router.get('/', getPaises);

/**
 * @route GET /api/paises/:id
 * @description Obtener país por ID
 * @access Público
 */
router.get('/:id', getPaisById);

// ═══════════════════════════════════════════════════════════════════════
// RUTAS SOLO ADMIN
// ═══════════════════════════════════════════════════════════════════════

/**
 * @route POST /api/paises
 * @description Crear nuevo país
 * @access Privado (solo admin)
 */
router.post('/', verifyToken, verifyAdmin, createPais);

/**
 * @route PUT /api/paises/:id
 * @description Actualizar país
 * @access Privado (solo admin)
 */
router.put('/:id', verifyToken, verifyAdmin, updatePais);

/**
 * @route DELETE /api/paises/:id
 * @description Eliminar país
 * @access Privado (solo admin)
 */
router.delete('/:id', verifyToken, verifyAdmin, deletePais);

// ═══════════════════════════════════════════════════════════════════════
// EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════

export default router;