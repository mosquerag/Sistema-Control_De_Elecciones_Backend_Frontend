/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: votos.js
 * UBICACIÓN: /backend/routes/votos.js
 * DESCRIPCIÓN: Rutas de votación
 * ═══════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import {
  createVoto,
  checkVoto,
  getMisVotos,
  getVotos,
  getVotosByEleccion,
  getVotoById,
} from '../controllers/votosController.js';
import { verifyToken, verifyCiudadano, verifyAdmin } from '../middlewares/verifyToken.js';
import { checkDuplicateVoto } from '../middlewares/checkDuplicateVoto.js';
import { voteLimiter } from '../middlewares/rateLimiter.js';


const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════
// RUTAS CIUDADANO
// ═══════════════════════════════════════════════════════════════════════

/**
 * @route POST /api/votos
 * @description Emitir voto
 * @access Privado (solo ciudadanos activos)
 */
// router.post('/', verifyToken, verifyCiudadano, checkDuplicateVoto, createVoto);
// router.post('/', voteLimiter, verifyToken, verifyCiudadano, checkDuplicateVoto, createVoto);
router.post('/', verifyToken, verifyCiudadano, voteLimiter, checkDuplicateVoto, createVoto);


/**
 * @route GET /api/votos/check/:idEleccion
 * @description Verificar si ya votó en una elección
 * @access Privado (solo ciudadanos)
 */
router.get('/check/:idEleccion', verifyToken, verifyCiudadano, checkVoto);

/**
 * @route GET /api/votos/mis-votos
 * @description Obtener historial de votos del ciudadano
 * @access Privado (solo ciudadanos)
 */
router.get('/mis-votos', verifyToken, verifyCiudadano, getMisVotos);

// ═══════════════════════════════════════════════════════════════════════
// RUTAS ADMIN
// ═══════════════════════════════════════════════════════════════════════

/**
 * @route GET /api/votos
 * @description Obtener todos los votos
 * @access Privado (solo admin)
 */
router.get('/', verifyToken, verifyAdmin, getVotos);

/**
 * @route GET /api/votos/eleccion/:idEleccion
 * @description Obtener votos por elección
 * @access Privado (solo admin)
 */
router.get('/eleccion/:idEleccion', verifyToken, verifyAdmin, getVotosByEleccion);

/**
 * @route GET /api/votos/:id
 * @description Obtener voto por ID
 * @access Privado (solo admin)
 */
router.get('/:id', verifyToken, verifyAdmin, getVotoById);

// ═══════════════════════════════════════════════════════════════════════
// EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════

export default router;