import express from 'express';
import Usuario from '../models/Usuario.js';
import Voto from '../models/Voto.js';
import Eleccion from '../models/Eleccion.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════
// RUTA: GET /api/public/stats
// ═══════════════════════════════════════════════════════════════════════

router.get('/stats', async (req, res) => {
  try {
    console.log('📊 [PUBLIC] Petición a /stats recibida');

    const [totalVotos, totalCiudadanos, totalCandidatos, eleccionesActivas] = await Promise.all([
      Voto.countDocuments(),
      Usuario.countDocuments({ rol: 'ciudadano', estado: 'activo' }),
      Usuario.countDocuments({ rol: 'candidato', estado: 'activo' }),
      Eleccion.countDocuments({ activa: true })
    ]);

    const ciudadanosQueVotaron = await Voto.distinct('idCiudadano');
    const totalCiudadanosQueVotaron = ciudadanosQueVotaron.length;

    const participacion = totalCiudadanos > 0 
      ? Math.round((totalCiudadanosQueVotaron / totalCiudadanos) * 100) 
      : 0;

    const data = {
      totalVotos,
      totalCiudadanos,
      totalCandidatos,
      eleccionesActivas,
      participacion,
      totalCiudadanosQueVotaron
    };

    console.log('✅ [PUBLIC] Estadísticas:', data);

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('❌ [PUBLIC] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

console.log('✅ Router público creado con ruta /stats');

export default router;