/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: Voto.js
 * UBICACIÓN: /backend/models/Voto.js
 * DESCRIPCIÓN: Modelo de votos del sistema
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * FUNCIÓN:
 * - Registra votos de ciudadanos
 * - Garantiza un voto por ciudadano por elección
 * - Mantiene trazabilidad de votación
 * 
 * DEPENDE DE:
 * - mongoose (ODM)
 * - Usuario.js (referencia a ciudadano y candidato)
 * - Eleccion.js (referencia a elección)
 * 
 * ES USADO POR:
 * - votosController.js
 * - estadisticasController.js
 */

import mongoose from 'mongoose';

const votoSchema = new mongoose.Schema(
  {
    /**
     * Ciudadano que emitió el voto
     * @required
     * @ref Usuario
     */
    idCiudadano: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El ID del ciudadano es obligatorio'],
    },

    /**
     * Elección en la que se votó
     * @required
     * @ref Eleccion
     */
    idEleccion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Eleccion',
      required: [true, 'El ID de la elección es obligatorio'],
    },

    /**
     * Candidato por el que se votó
     * @required
     * @ref Usuario
     */
    // idCandidato: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Usuario',
    //   required: [true, 'El ID del candidato es obligatorio'],
    // },

    /**
     * Fecha y hora del voto
     * @default Date.now
     */
    fechaVoto: {
      type: Date,
      default: Date.now,
    },

    /**
     * Dirección IP desde donde se votó
     * @optional
     */
    ipAddress: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ═══════════════════════════════════════════════════════════════════════
// ÍNDICES
// ═══════════════════════════════════════════════════════════════════════

// Índice único para prevenir voto duplicado
votoSchema.index({ idCiudadano: 1, idEleccion: 1 }, { unique: true });

// Índices para consultas comunes
votoSchema.index({ idEleccion: 1 });
// votoSchema.index({ idCandidato: 1 });
votoSchema.index({ fechaVoto: -1 });

export default mongoose.model('Voto', votoSchema);