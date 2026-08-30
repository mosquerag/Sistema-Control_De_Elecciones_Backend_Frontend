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

