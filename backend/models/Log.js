/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: Log.js
 * UBICACIÓN: /backend/models/Log.js
 * DESCRIPCIÓN: Modelo de logs de auditoría del sistema
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * FUNCIÓN:
 * - Registra todas las acciones importantes del sistema
 * - Proporciona trazabilidad completa
 * - Cumple con requisitos de auditoría empresarial
 * - Permite análisis de comportamiento
 * - Detecta actividades sospechosas
 * 
 * DEPENDE DE:
 * - mongoose (ODM)
 * - Usuario.js (referencia opcional)
 * 
 * ES USADO POR:
 * - approvalController.js (aprobaciones, rechazos, bloqueos)
 * - authController.js (login, registro, cambio de password)
 * - profileController.js (actualización de perfil)
 * - googleOAuth.js (autenticación con Google)
 * - votosController.js (emisión de votos)
 * - Cualquier controlador que realice acciones críticas
 * 
 * TIPOS DE ACCIONES REGISTRADAS:
 * - Autenticación: login, logout, login_google, registro
 * - Aprobación: aprobar_usuario, rechazar_usuario, bloquear_usuario
 * - Perfil: actualizar_perfil, cambiar_password
 * - Votación: emitir_voto
 * - Administración: crear_eleccion, modificar_eleccion, etc.
 */

import mongoose from 'mongoose';

// ═══════════════════════════════════════════════════════════════════════
// DEFINICIÓN DEL SCHEMA
// ═══════════════════════════════════════════════════════════════════════

const logSchema = new mongoose.Schema(
  {
    // ══════════════════════════════════════════════════════════════════
    // INFORMACIÓN DE LA ACCIÓN
    // ══════════════════════════════════════════════════════════════════

    /**
     * Tipo de acción realizada
     * @required
     */
    accion: {
      type: String,
      required: [true, 'La acción es obligatoria'],
      trim: true,
      enum: {
        values: [
          // Autenticación
          'login',
          'login_admin',
          'login_ciudadano',
          'login_candidato',
          'login_google',
          'logout',
          'registro',
          'registro_google',
          'registro_por_admin',   
          'cambiar_password',
          'intento_login_fallido',
          
          // Aprobación
          'aprobar_usuario',
          'rechazar_usuario',
          'rechazar_usuario_notificacion',
          'bloquear_usuario',
          'desbloquear_usuario',
          
          // Perfil
          'actualizar_perfil',
          'actualizar_foto',
          
          // Votación
          'emitir_voto',
          'intento_voto_duplicado',
          
          // Administración
          'crear_eleccion',
          'actualizar_eleccion',
          'eliminar_eleccion',
          'crear_candidato',
          'actualizar_candidato',
          'eliminar_candidato',
          'crear_usuario',
          'actualizar_usuario',
          'eliminar_usuario',
          
          // Sistema
          'error_sistema',
          'acceso_denegado',
          'accion_sospechosa',
        ],
        message: 'Tipo de acción inválido',
      },
    },

    /**
     * Tipo de usuario que realizó la acción
     * @required
     */
    tipoUsuario: {
      type: String,
      required: [true, 'El tipo de usuario es obligatorio'],
      enum: {
        values: ['admin', 'ciudadano', 'candidato', 'sistema', 'anonimo'],
        message: 'Tipo de usuario inválido',
      },
    },

    /**
     * Usuario que realizó la acción
     * @optional (puede ser null para acciones del sistema o anónimas)
     * @ref Usuario
     */
    idUsuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null,
    },

    /**
     * Usuario afectado por la acción (si aplica)
     * @optional
     * @ref Usuario
     * 
     * Ejemplos:
     * - Admin aprueba a ciudadano → idUsuarioAfectado = ciudadano
     * - Admin bloquea a candidato → idUsuarioAfectado = candidato
     */
    idUsuarioAfectado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null,
    },

    /**
     * Detalles adicionales de la acción (flexible)
     * @optional
     * 
     * Ejemplos:
     * - Login: { email, exito: true }
     * - Aprobación: { nombre, cedula, motivoRechazo }
     * - Voto: { idEleccion, idCandidato }
     */
    detalles: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ══════════════════════════════════════════════════════════════════
    // INFORMACIÓN DE RASTREO
    // ══════════════════════════════════════════════════════════════════

    /**
     * Dirección IP desde donde se realizó la acción
     * @optional
     */
    ipAddress: {
      type: String,
      default: null,
      trim: true,
    },

    /**
     * User Agent del navegador/dispositivo
     * @optional
     */
    userAgent: {
      type: String,
      default: null,
      trim: true,
    },

    /**
     * Geolocalización aproximada (si está disponible)
     * @optional
     */
    geolocalizacion: {
      pais: { type: String, default: null },
      ciudad: { type: String, default: null },
      coordenadas: {
        latitud: { type: Number, default: null },
        longitud: { type: Number, default: null },
      },
    },

    // ══════════════════════════════════════════════════════════════════
    // RESULTADO Y METADATA
    // ══════════════════════════════════════════════════════════════════

    /**
     * Resultado de la acción
     * @default exito
     * @enum exito, fallo, pendiente
     */
    resultado: {
      type: String,
      enum: {
        values: ['exito', 'fallo', 'pendiente'],
        message: 'Resultado inválido',
      },
      default: 'exito',
    },

    /**
     * Mensaje de error (si la acción falló)
     * @optional
     */
    mensajeError: {
      type: String,
      default: null,
      trim: true,
    },

    /**
     * Duración de la operación en milisegundos
     * @optional
     */
    duracion: {
      type: Number,
      default: null,
      min: 0,
    },

    /**
     * Nivel de severidad del log
     * @default info
     * @enum debug, info, warning, error, critical
     */
    severidad: {
      type: String,
      enum: {
        values: ['debug', 'info', 'warning', 'error', 'critical'],
        message: 'Severidad inválida',
      },
      default: 'info',
    },

    /**
     * Metadatos adicionales del sistema
     * @optional
     */
    metadata: {
      version: { type: String, default: null },
      entorno: { type: String, default: process.env.NODE_ENV || 'development' },
      servidor: { type: String, default: null },
    },
  },
  {
    // Opciones del schema
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    versionKey: false, // Desactiva __v
  }
);

// ═══════════════════════════════════════════════════════════════════════
// ÍNDICES
// ═══════════════════════════════════════════════════════════════════════

// Índice para consultas por acción
logSchema.index({ accion: 1 });

// Índice para consultas por usuario
logSchema.index({ idUsuario: 1 });

// Índice para consultas por usuario afectado
logSchema.index({ idUsuarioAfectado: 1 });

// Índice para consultas por fecha (más recientes primero)
logSchema.index({ createdAt: -1 });

// Índice para consultas por resultado
logSchema.index({ resultado: 1 });

// Índice para consultas por severidad
logSchema.index({ severidad: 1 });

// Índice para consultas por IP (detectar actividad sospechosa)
logSchema.index({ ipAddress: 1 });

// Índice compuesto para auditorías
logSchema.index({ accion: 1, tipoUsuario: 1, createdAt: -1 });

// Índice compuesto para errores
logSchema.index({ resultado: 1, severidad: 1, createdAt: -1 });

// ═══════════════════════════════════════════════════════════════════════
// MÉTODOS ESTÁTICOS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Registra una acción en el sistema
 * @param {Object} datos - Datos del log
 * @returns {Promise<Log>}
 */
logSchema.statics.registrar = async function (datos) {
  const log = new this(datos);
  return await log.save();
};

/**
 * Obtiene logs por usuario
 * @param {ObjectId} idUsuario - ID del usuario
 * @param {Number} limit - Límite de resultados
 * @returns {Promise<Array>}
 */
logSchema.statics.porUsuario = async function (idUsuario, limit = 50) {
  return await this.find({ idUsuario })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('idUsuarioAfectado', 'nombre email cedula');
};

/**
 * Obtiene logs de una acción específica
 * @param {String} accion - Tipo de acción
 * @param {Number} limit - Límite de resultados
 * @returns {Promise<Array>}
 */
logSchema.statics.porAccion = async function (accion, limit = 100) {
  return await this.find({ accion })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('idUsuario', 'nombre email rol')
    .populate('idUsuarioAfectado', 'nombre email cedula');
};

/**
 * Obtiene logs de errores
 * @param {Number} limit - Límite de resultados
 * @returns {Promise<Array>}
 */
logSchema.statics.errores = async function (limit = 50) {
  return await this.find({ resultado: 'fallo' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('idUsuario', 'nombre email rol');
};

/**
 * Obtiene logs críticos
 * @param {Number} limit - Límite de resultados
 * @returns {Promise<Array>}
 */
logSchema.statics.criticos = async function (limit = 50) {
  return await this.find({ severidad: { $in: ['error', 'critical'] } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('idUsuario', 'nombre email rol');
};

/**
 * Obtiene estadísticas de logs
 * @param {Date} desde - Fecha inicio
 * @param {Date} hasta - Fecha fin
 * @returns {Promise<Object>}
 */
logSchema.statics.estadisticas = async function (desde, hasta) {
  const query = {};
  
  if (desde || hasta) {
    query.createdAt = {};
    if (desde) query.createdAt.$gte = desde;
    if (hasta) query.createdAt.$lte = hasta;
  }

  const [porAccion, porResultado, porSeveridad, total] = await Promise.all([
    this.aggregate([
      { $match: query },
      { $group: { _id: '$accion', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    this.aggregate([
      { $match: query },
      { $group: { _id: '$resultado', total: { $sum: 1 } } },
    ]),
    this.aggregate([
      { $match: query },
      { $group: { _id: '$severidad', total: { $sum: 1 } } },
    ]),
    this.countDocuments(query),
  ]);

  return {
    total,
    porAccion,
    porResultado,
    porSeveridad,
  };
};

/**
 * Detecta actividad sospechosa de una IP
 * @param {String} ipAddress - Dirección IP
 * @param {Number} minutos - Ventana de tiempo (default: 15)
 * @returns {Promise<Object>}
 */
logSchema.statics.actividadSospechosa = async function (ipAddress, minutos = 15) {
  const desde = new Date();
  desde.setMinutes(desde.getMinutes() - minutos);

  const intentos = await this.countDocuments({
    ipAddress,
    accion: { $in: ['intento_login_fallido', 'acceso_denegado'] },
    createdAt: { $gte: desde },
  });

  return {
    ipAddress,
    intentos,
    sospechosa: intentos >= 5, // 5 o más intentos fallidos en 15 min
    desde,
  };
};

/**
 * Limpia logs antiguos (más de X días)
 * @param {Number} dias - Días de antigüedad (default: 365)
 * @param {String} severidad - Solo limpiar logs de cierta severidad
 * @returns {Promise<Object>}
 */
logSchema.statics.limpiarAntiguos = async function (dias = 365, severidad = null) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  
  const query = {
    createdAt: { $lt: fecha },
  };

  // Solo limpiar logs de baja severidad
  if (severidad) {
    query.severidad = severidad;
  } else {
    query.severidad = { $in: ['debug', 'info'] };
  }

  return await this.deleteMany(query);
};

/**
 * Obtiene historial de un usuario específico afectado
 * @param {ObjectId} idUsuario - ID del usuario
 * @returns {Promise<Array>}
 */
logSchema.statics.historialUsuario = async function (idUsuario) {
  return await this.find({
    $or: [
      { idUsuario },
      { idUsuarioAfectado: idUsuario },
    ],
  })
    .sort({ createdAt: -1 })
    .populate('idUsuario', 'nombre email rol')
    .populate('idUsuarioAfectado', 'nombre email rol');
};

// ═══════════════════════════════════════════════════════════════════════
// MÉTODOS DE INSTANCIA
// ═══════════════════════════════════════════════════════════════════════

/**
 * Verifica si el log representa un error
 * @returns {Boolean}
 */
logSchema.methods.esError = function () {
  return this.resultado === 'fallo' || ['error', 'critical'].includes(this.severidad);
};

/**
 * Obtiene un resumen legible del log
 * @returns {String}
 */
logSchema.methods.resumen = function () {
  const fecha = this.createdAt.toLocaleString('es-DO');
  return `[${fecha}] ${this.accion} - ${this.resultado} (${this.severidad})`;
};

// ═══════════════════════════════════════════════════════════════════════
// EXPORTACIÓN DEL MODELO
// ═══════════════════════════════════════════════════════════════════════

export default mongoose.model('Log', logSchema);

/**
 * ═══════════════════════════════════════════════════════════════════════
 * EJEMPLOS DE USO:
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * // Registrar login exitoso
 * await Log.create({
 *   accion: 'login',
 *   tipoUsuario: 'ciudadano',
 *   idUsuario: usuario._id,
 *   detalles: {
 *     email: usuario.email,
 *     cedula: usuario.cedula,
 *   },
 *   ipAddress: req.ip,
 *   userAgent: req.headers['user-agent'],
 *   resultado: 'exito',
 *   severidad: 'info',
 * });
 * 
 * // Registrar aprobación de usuario
 * await Log.registrar({
 *   accion: 'aprobar_usuario',
 *   tipoUsuario: 'admin',
 *   idUsuario: adminId,
 *   idUsuarioAfectado: usuarioAprobado._id,
 *   detalles: {
 *     nombre: usuarioAprobado.nombre,
 *     cedula: usuarioAprobado.cedula,
 *     rol: usuarioAprobado.rol,
 *   },
 *   resultado: 'exito',
 *   severidad: 'info',
 * });
 * 
 * // Registrar intento de login fallido
 * await Log.create({
 *   accion: 'intento_login_fallido',
 *   tipoUsuario: 'anonimo',
 *   detalles: {
 *     email: email,
 *     motivo: 'Credenciales incorrectas',
 *   },
 *   ipAddress: req.ip,
 *   resultado: 'fallo',
 *   severidad: 'warning',
 * });
 * 
 * // Obtener logs de un usuario
 * const logs = await Log.porUsuario(userId, 20);
 * 
 * // Obtener estadísticas de la última semana
 * const hace7dias = new Date();
 * hace7dias.setDate(hace7dias.getDate() - 7);
 * const stats = await Log.estadisticas(hace7dias, new Date());
 * 
 * // Detectar actividad sospechosa
 * const sospechosa = await Log.actividadSospechosa(ipAddress, 15);
 * if (sospechosa.sospechosa) {
 *   // Bloquear IP temporalmente
 * }
 * 
 * // Limpiar logs antiguos (más de 1 año, solo info y debug)
 * const resultado = await Log.limpiarAntiguos(365);
 * console.log(`${resultado.deletedCount} logs eliminados`);
 * 
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * BUENAS PRÁCTICAS:
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * 1. SIEMPRE registra acciones críticas:
 *    - Login/Logout
 *    - Registro de usuarios
 *    - Aprobaciones/Rechazos
 *    - Emisión de votos
 *    - Cambios en elecciones
 * 
 * 2. USA severidad apropiada:
 *    - debug: Información de desarrollo
 *    - info: Acciones normales
 *    - warning: Situaciones inusuales
 *    - error: Errores recuperables
 *    - critical: Errores graves
 * 
 * 3. INCLUYE información útil en detalles:
 *    - IDs relevantes
 *    - Valores antes/después
 *    - Motivos de acciones
 * 
 * 4. LIMPIA logs regularmente:
 *    - Programa tarea para limpiar logs antiguos
 *    - Mantén logs críticos por más tiempo
 * 
 * 5. MONITOREA actividad sospechosa:
 *    - Múltiples intentos de login fallidos
 *    - Accesos desde IPs diferentes
 *    - Acciones inusuales
 * 
 * ═══════════════════════════════════════════════════════════════════════
 */