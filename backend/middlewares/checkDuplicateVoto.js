/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: checkDuplicateVoto.js
 * UBICACIÓN: /backend/middlewares/checkDuplicateVoto.js
 * DESCRIPCIÓN: Middleware para prevenir votos duplicados
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * FUNCIÓN:
 * - Verifica que el ciudadano no haya votado ya en la elección
 * - Previene fraude electoral
 * - Garantiza: Un ciudadano = Un voto por elección
 * 
 * DEPENDE DE:
 * - Voto.js (modelo)
 * - verifyToken.js (req.user debe existir)
 * 
 * ES USADO POR:
 * - routes/votos.js (POST /api/votos)
 * 
 * IMPORTANTE:
 * - Este middleware debe ejecutarse DESPUÉS de verifyToken
 * - Requiere req.user.id (ID del ciudadano autenticado)
 * - Requiere req.body.idEleccion (ID de la elección)
 */

import Voto from '../models/Voto.js';

/**
 * Verifica que el ciudadano no haya votado ya en esta elección
 * 
 * @middleware
 * @requires verifyToken (debe ejecutarse antes)
 * @requires verifyCiudadano (debe ejecutarse antes)
 * 
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Siguiente middleware
 * 
 * @description
 * 1. Obtiene el ID del ciudadano autenticado (req.user.id)
 * 2. Obtiene el ID de la elección (req.body.idEleccion)
 * 3. Busca si ya existe un voto con esa combinación
 * 4. Si existe → Bloquea y retorna error 400
 * 5. Si NO existe → Permite continuar
 * 
 * @ejemplo
 * router.post('/', verifyCiudadano, checkDuplicateVoto, createVoto);
 */
export const checkDuplicateVoto = async (req, res, next) => {
  try {
    // Validar que exista el usuario autenticado
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado.',
        error: 'NOT_AUTHENTICATED',
      });
    }

    // Obtener datos necesarios
    const { idEleccion } = req.body;
    const idCiudadano = req.user._id;

    // Validar que se haya proporcionado la elección
    if (!idEleccion) {
      return res.status(400).json({
        success: false,
        message: 'El ID de la elección es obligatorio.',
        error: 'MISSING_ELECTION_ID',
      });
    }

    // Log para debugging (solo en desarrollo)
    if (process.env.DEBUG_MODE === 'true') {
      console.log('🔍 Verificando voto duplicado:');
      console.log('   Ciudadano:', idCiudadano);
      console.log('   Elección:', idEleccion);
    }

    // Buscar si ya existe un voto
    const votoExistente = await Voto.findOne({
      idCiudadano,
      idEleccion,
    });

    // Si ya votó, bloquear
    if (votoExistente) {
      console.log('⚠️ Intento de voto duplicado detectado:');
      console.log('   Ciudadano:', idCiudadano);
      console.log('   Elección:', idEleccion);
      console.log('   Fecha del voto anterior:', votoExistente.fechaVoto);

      return res.status(400).json({
        success: false,
        message: 'Ya has votado en esta elección.',
        error: 'DUPLICATE_VOTE',
        data: {
          fechaVoto: votoExistente.fechaVoto,
          idEleccion: votoExistente.idEleccion,
        },
      });
    }

    // Si no ha votado, permitir continuar
    if (process.env.DEBUG_MODE === 'true') {
      console.log('✅ Voto permitido - No hay duplicados');
    }

    next();
  } catch (error) {
    console.error('❌ Error en checkDuplicateVoto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar voto duplicado.',
      error: error.message,
    });
  }
};

/**
 * Exportación por defecto
 */
export default checkDuplicateVoto;

/**
 * ═══════════════════════════════════════════════════════════════════════
 * EJEMPLO DE USO:
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * En routes/votos.js:
 * 
 * import { verifyToken, verifyCiudadano } from '../middlewares/verifyToken.js';
 * import { checkDuplicateVoto } from '../middlewares/checkDuplicateVoto.js';
 * import { createVoto } from '../controllers/votosController.js';
 * 
 * router.post(
 *   '/',
 *   verifyToken,           // 1. Verificar autenticación
 *   verifyCiudadano,       // 2. Verificar que sea ciudadano activo
 *   checkDuplicateVoto,    // 3. Verificar que no haya votado
 *   createVoto             // 4. Crear el voto
 * );
 * 
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * FLUJO:
 * 
 * 1. POST /api/votos
 *    Body: { idEleccion: "...", idCandidato: "..." }
 * 
 * 2. verifyToken
 *    → Extrae token
 *    → Verifica JWT
 *    → Busca usuario
 *    → Agrega req.user
 * 
 * 3. verifyCiudadano
 *    → Verifica rol === 'ciudadano'
 *    → Verifica estado === 'activo'
 * 
 * 4. checkDuplicateVoto (ESTE MIDDLEWARE)
 *    → Busca voto existente
 *    → Si existe → Retorna 400 "Ya has votado"
 *    → Si NO existe → Continúa
 * 
 * 5. createVoto
 *    → Crea el voto
 *    → Incrementa contadores
 *    → Retorna 201
 * 
 * ═══════════════════════════════════════════════════════════════════════
 */