/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: Notificacion.js
 * UBICACIÓN: /backend/models/Notificacion.js
 * DESCRIPCIÓN: Modelo de notificaciones para el sistema de aprobación
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * FUNCIÓN:
 * - Gestiona notificaciones para administradores
 * - Registra eventos de registro de usuarios
 * - Permite que múltiples admins vean notificaciones
 * - Oculta notificaciones procesadas
 * - Rastrea quién procesó cada notificación
 * 
 * DEPENDE DE:
 * - mongoose (ODM)
 * - Usuario.js (referencia)
 * 
 * ES USADO POR:
 * - approvalController.js (gestión de aprobaciones)
 * - authController.js (creación al registrarse)
 * - googleOAuth.js (creación al registrarse con Google)
 * - notificaciones.js (rutas de consulta)
 * 
 * TIPOS DE NOTIFICACIONES:
 * - nuevo_registro: Ciudadano se registró
 * - nueva_postulacion: Candidato se postuló
 * - actualizacion_perfil: Usuario actualizó su perfil
 * - solicitud_reactivacion: Usuario bloqueado pide reactivación
 * 
 * FLUJO:
 * 1. Usuario se registra → Se crea notificación
 * 2. Todos los admins ven la notificación
 * 3. Un admin procesa (aprueba/rechaza/bloquea)
 * 4. La notificación se marca como procesada
 * 5. La notificación desaparece para todos los admins
 */

import mongoose from 'mongoose';

// ═══════════════════════════════════════════════════════════════════════
// DEFINICIÓN DEL SCHEMA
// ═══════════════════════════════════════════════════════════════════════

const notificacionSchema = new mongoose.Schema(
  {
    // ══════════════════════════════════════════════════════════════════
    // INFORMACIÓN PRINCIPAL
    // ══════════════════════════════════════════════════════════════════

    /**
     * Tipo de notificación
     * @required
     * @enum nuevo_registro, nueva_postulacion, actualizacion_perfil, solicitud_reactivacion
     */
    tipo: {
      type: String,
      required: [true, 'El tipo de notificación es obligatorio'],
      enum: {
        values: [
          'nuevo_registro',
          'nueva_postulacion',
          'actualizacion_perfil',
          'solicitud_reactivacion',
          'cambio_estado',
          'documento_actualizado'
        ],
        message: 'Tipo de notificación inválido',
      },
    },

    /**
     * Tipo de usuario que generó la notificación
     * @required
     * @enum ciudadano, candidato
     */
    tipoUsuario: {
      type: String,
      required: [true, 'El tipo de usuario es obligatorio'],
      enum: {
        values: ['ciudadano', 'candidato'],
        message: 'Tipo de usuario inválido',
      },
    },

    /**
     * Usuario que generó la notificación
     * @required
     * @ref Usuario
     */
    idUsuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El ID del usuario es obligatorio'],
    },

    /**
     * Mensaje de la notificación
     * @required
     */
    mensaje: {
      type: String,
      required: [true, 'El mensaje es obligatorio'],
      trim: true,
      maxlength: [500, 'El mensaje no puede exceder 500 caracteres'],
    },

    /**
     * Datos adicionales de la notificación (flexible)
     * @optional
     * 
     * Ejemplos:
     * - { nombre: "Juan", email: "juan@gmail.com", cedula: "12345678901" }
     * - { cambios: ["nombre", "foto"], anterior: {...}, nuevo: {...} }
     */
    datos: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ══════════════════════════════════════════════════════════════════
    // ESTADO DE LA NOTIFICACIÓN
    // ══════════════════════════════════════════════════════════════════

    /**
     * Indica si la notificación es visible para los admins
     * @default true
     * 
     * - true: Aparece en la lista de notificaciones
     * - false: Oculta (ya fue procesada)
     */
    visible: {
      type: Boolean,
      default: true,
    },

    /**
     * Indica si la notificación fue procesada
     * @default false
     */
    procesada: {
      type: Boolean,
      default: false,
    },

    /**
     * Fecha en que fue procesada
     * @optional
     */
    fechaProcesada: {
      type: Date,
      default: null,
    },

    /**
     * Admin que procesó la notificación
     * @optional
     * @ref Usuario (admin)
     */
    procesadaPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null,
    },

    /**
     * Acción tomada al procesar
     * @optional
     * @enum aprobar, rechazar, bloquear
     */
    accionTomada: {
      type: String,
      enum: {
        values: ['aprobar', 'rechazar', 'bloquear', null],
        message: 'Acción inválida',
      },
      default: null,
    },

    /**
     * Lista de admins que han leído la notificación
     * @default []
     */
    leidaPor: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Usuario',
        },
      ],
      default: [],
    },

    /**
     * Prioridad de la notificación
     * @default media
     * @enum baja, media, alta, urgente
     */
    prioridad: {
      type: String,
      enum: {
        values: ['baja', 'media', 'alta', 'urgente'],
        message: 'Prioridad inválida',
      },
      default: 'media',
    },

    /**
     * Comentarios adicionales del admin
     * @optional
     */
    comentarios: {
      type: String,
      default: null,
      maxlength: [1000, 'Los comentarios no pueden exceder 1000 caracteres'],
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

// Índice para consultas de notificaciones visibles y no procesadas
notificacionSchema.index({ visible: 1, procesada: 1 });

// Índice para consultas por tipo de usuario
notificacionSchema.index({ tipoUsuario: 1, visible: 1 });

// Índice para consultas por usuario específico
notificacionSchema.index({ idUsuario: 1 });

// Índice para consultas por fecha (más recientes primero)
notificacionSchema.index({ createdAt: -1 });

// Índice compuesto para notificaciones pendientes
notificacionSchema.index({ visible: 1, procesada: 1, prioridad: -1, createdAt: -1 });

// ═══════════════════════════════════════════════════════════════════════
// MÉTODOS DE INSTANCIA
// ═══════════════════════════════════════════════════════════════════════

/**
 * Marca la notificación como leída por un admin
 * @param {ObjectId} adminId - ID del admin que leyó
 */
notificacionSchema.methods.marcarComoLeida = function (adminId) {
  if (!this.leidaPor.includes(adminId)) {
    this.leidaPor.push(adminId);
  }
};

/**
 * Procesa la notificación
 * @param {ObjectId} adminId - ID del admin que procesa
 * @param {String} accion - Acción tomada (aprobar, rechazar, bloquear)
 * @param {String} comentarios - Comentarios opcionales
 */
notificacionSchema.methods.procesar = function (adminId, accion, comentarios = null) {
  this.procesada = true;
  this.visible = false; // Ocultar para todos los admins
  this.fechaProcesada = new Date();
  this.procesadaPor = adminId;
  this.accionTomada = accion;
  
  if (comentarios) {
    this.comentarios = comentarios;
  }

  // Asegurar que el admin que procesó esté en leidaPor
  this.marcarComoLeida(adminId);
};

/**
 * Verifica si un admin específico ya leyó la notificación
 * @param {ObjectId} adminId - ID del admin
 * @returns {Boolean}
 */
notificacionSchema.methods.fueLeida = function (adminId) {
  return this.leidaPor.some(id => id.equals(adminId));
};

/**
 * Obtiene el tiempo transcurrido desde la creación
 * @returns {String} Tiempo en formato legible
 */
notificacionSchema.methods.tiempoTranscurrido = function () {
  const ahora = new Date();
  const diferencia = ahora - this.createdAt;
  
  const minutos = Math.floor(diferencia / 60000);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  
  if (dias > 0) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
  if (horas > 0) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
  if (minutos > 0) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  return 'Hace un momento';
};

// ═══════════════════════════════════════════════════════════════════════
// MÉTODOS ESTÁTICOS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Obtiene todas las notificaciones pendientes (visibles y no procesadas)
 * @param {String} tipo - Filtrar por tipo (opcional)
 * @param {Object} filtros - Filtros adicionales (opcional)
 * @returns {Promise<Array>}
 */
notificacionSchema.statics.obtenerPendientes = async function (tipo = null, filtros = {}) {
  const query = {
    visible: true,
    procesada: false,
    ...filtros,
  };
  
  if (tipo) {
    query.tipoUsuario = tipo;
  }
  
  return await this.find(query)
    .populate('idUsuario', 'nombre email cedula fotoPerfil rol partido propuestas')
    .populate('procesadaPor', 'nombre email')
    .sort({ prioridad: -1, createdAt: -1 });
};

/**
 * Obtiene notificaciones no leídas por un admin específico
 * @param {ObjectId} adminId - ID del admin
 * @returns {Promise<Array>}
 */
notificacionSchema.statics.obtenerNoLeidas = async function (adminId) {
  return await this.find({
    visible: true,
    procesada: false,
    leidaPor: { $ne: adminId },
  })
    .populate('idUsuario', 'nombre email cedula fotoPerfil rol')
    .sort({ prioridad: -1, createdAt: -1 });
};

/**
 * Cuenta notificaciones pendientes por tipo
 * @returns {Promise<Object>}
 */
notificacionSchema.statics.contarPendientes = async function () {
  const resultados = await this.aggregate([
    {
      $match: {
        visible: true,
        procesada: false,
      },
    },
    {
      $group: {
        _id: '$tipoUsuario',
        total: { $sum: 1 },
      },
    },
  ]);

  return resultados.reduce((acc, curr) => {
    acc[curr._id] = curr.total;
    return acc;
  }, {});
};

/**
 * Limpia notificaciones antiguas procesadas (más de X días)
 * @param {Number} dias - Días de antigüedad (default: 90)
 * @returns {Promise<Object>}
 */
notificacionSchema.statics.limpiarAntiguas = async function (dias = 90) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  
  return await this.deleteMany({
    procesada: true,
    fechaProcesada: { $lt: fecha },
  });
};

/**
 * Crea una notificación de registro
 * @param {Object} usuario - Usuario que se registró
 * @param {String} metodoRegistro - 'tradicional' o 'google'
 * @returns {Promise<Notificacion>}
 */
notificacionSchema.statics.crearNotificacionRegistro = async function (usuario, metodoRegistro = 'tradicional') {
  const tipo = usuario.rol === 'candidato' ? 'nueva_postulacion' : 'nuevo_registro';
  
  const notificacion = new this({
    tipo,
    tipoUsuario: usuario.rol,
    idUsuario: usuario._id,
    mensaje: `Nuevo ${usuario.rol} registrado${metodoRegistro === 'google' ? ' con Google' : ''}: ${usuario.nombre}`,
    datos: {
      nombre: usuario.nombre,
      email: usuario.email,
      cedula: usuario.cedula,
      rol: usuario.rol,
      metodoRegistro,
      partido: usuario.partido || null,
    },
    prioridad: usuario.rol === 'candidato' ? 'alta' : 'media',
  });

  return await notificacion.save();
};

// ═══════════════════════════════════════════════════════════════════════
// VIRTUAL FIELDS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Virtual: Indica si la notificación es nueva (menos de 24h)
 */
notificacionSchema.virtual('esNueva').get(function () {
  const ahora = new Date();
  const diferencia = ahora - this.createdAt;
  const horas = diferencia / (1000 * 60 * 60);
  return horas < 24;
});

/**
 * Virtual: Cantidad de admins que la leyeron
 */
notificacionSchema.virtual('cantidadLecturas').get(function () {
  return this.leidaPor.length;
});

// Habilitar virtuals en JSON
notificacionSchema.set('toJSON', { virtuals: true });
notificacionSchema.set('toObject', { virtuals: true });

// ═══════════════════════════════════════════════════════════════════════
// EXPORTACIÓN DEL MODELO
// ═══════════════════════════════════════════════════════════════════════

export default mongoose.model('Notificacion', notificacionSchema);
