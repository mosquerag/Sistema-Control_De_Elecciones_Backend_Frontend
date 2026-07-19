/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: estadisticas.js
 * UBICACIÓN: /backend/routes/estadisticas.js
 * DESCRIPCIÓN: Rutas de estadísticas y resultados
 * ═══════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import {
  getResultadosEleccion,
  getResultadosCandidato,
  getEvolucionVotos,
} from '../controllers/estadisticasController.js';
import { verifyToken, verifyAdmin } from '../middlewares/verifyToken.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════
// RUTAS DE ESTADÍSTICAS
// ═══════════════════════════════════════════════════════════════════════

/**
 * @route GET /api/estadisticas/eleccion/:idEleccion
 * @description Obtener resultados generales de una elección
 * @access Privado (cualquier usuario autenticado)
 */
router.get('/eleccion/:idEleccion', verifyToken, getResultadosEleccion);

/**
 * @route GET /api/estadisticas/candidato
 * @description Obtener resultados de un candidato específico (solo ese candidato)
 * @access Privado (solo el candidato puede ver sus resultados)
 */
router.get('/candidato', verifyToken, getResultadosCandidato);

/**
 * @route GET /api/estadisticas/evolucion/:idCandidato
 * @description Obtener evolución de votos por hora (para gráficos)
 * @access Privado
 */
router.get('/evolucion/:idCandidato', verifyToken, getEvolucionVotos);

// ═══════════════════════════════════════════════════════════════════════
// EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════

export default router;