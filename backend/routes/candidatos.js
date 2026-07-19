/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: candidatos.js
 * UBICACIÓN: /backend/routes/candidatos.js
 * DESCRIPCIÓN: Rutas CRUD de candidatos
 * ═══════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import {
  getCandidatos,
  getCandidatosByEleccion,
  getCandidatoById,
  updateCandidato,
  deleteCandidato,
  desactivarCandidato,
} from '../controllers/candidatosController.js';
import { verifyToken, verifyAdmin } from '../middlewares/verifyToken.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════
// RUTAS PÚBLICAS
// ═══════════════════════════════════════════════════════════════════════

/**
 * @route GET /api/candidatos
 * @description Obtener todos los candidatos activos
 * @access Público
 */
router.get('/', getCandidatos);

/**
 * @route GET /api/candidatos/eleccion/:idEleccion
 * @description Obtener candidatos por elección
 * @access Público
 */
router.get('/eleccion/:idEleccion', getCandidatosByEleccion);

/**
 * @route GET /api/candidatos/:id
 * @description Obtener candidato por ID
 * @access Público
 */
router.get('/:id', getCandidatoById);

// ═══════════════════════════════════════════════════════════════════════
// RUTAS SOLO ADMIN
// ═══════════════════════════════════════════════════════════════════════

/**
 * @route PUT /api/candidatos/:id
 * @description Actualizar candidato
 * @access Privado (solo admin)
 */
router.put('/:id', verifyToken, verifyAdmin, updateCandidato);

/**
 * @route PATCH /api/candidatos/:id/desactivar
 * @description Desactivar candidato
 * @access Privado (solo admin)
 */
router.patch('/:id/desactivar', verifyToken, verifyAdmin, desactivarCandidato);

/**
 * @route DELETE /api/candidatos/:id
 * @description Eliminar candidato (solo si no tiene votos)
 * @access Privado (solo admin)
 */
router.delete('/:id', verifyToken, verifyAdmin, deleteCandidato);

// ═══════════════════════════════════════════════════════════════════════
// EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════

export default router;