/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: Encuesta.js
 * UBICACIÓN: /backend/models/Encuesta.js
 * DESCRIPCIÓN: Modelo de encuestas de satisfacción
 * ═══════════════════════════════════════════════════════════════════════
 */

import mongoose from 'mongoose';

const encuestaSchema = new mongoose.Schema(
  {
    pregunta: {
      type: String,
      required: true,
      trim: true
    },
    respuesta: {
      type: String,
      required: true,
      enum: [
        'Muy satisfecho con el sistema actual',
        'Satisfecho, pero necesita mejoras',
        'Neutral',
        'Insatisfecho con algunas características'
      ]
    },
    idUsuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null // Permitir respuestas anónimas
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Índices
encuestaSchema.index({ createdAt: -1 });
encuestaSchema.index({ respuesta: 1 });

const Encuesta = mongoose.model('Encuesta', encuestaSchema);

export default Encuesta;