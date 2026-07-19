/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: VotoAnonimo.js
 * UBICACIÓN: /backend/models/VotoAnonimo.js
 * DESCRIPCIÓN: Conteo anónimo de votos por candidato
 * ═══════════════════════════════════════════════════════════════════════
 *
 * FUNCIÓN:
 * - Registra que un candidato recibió un voto en una elección
 * - NO tiene ningún campo que lo vincule a un ciudadano específico
 * - Es la única fuente de verdad para resultados y estadísticas
 *
 * IMPORTANTE:
 * Este modelo existe separado de Voto.js a propósito: Voto.js solo
 * registra "esta cédula ya votó en esta elección" (para evitar doble
 * voto), sin saber por quién. Este modelo solo sabe "este candidato
 * recibió un voto", sin saber de quién. Ningún documento de la base
 * de datos conecta ambas cosas.
 */

import mongoose from 'mongoose';

const votoAnonimoSchema = new mongoose.Schema(
  {
    idEleccion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Eleccion',
      required: [true, 'El ID de la elección es obligatorio'],
    },

    idCandidato: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El ID del candidato es obligatorio'],
    },

    fechaVoto: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

votoAnonimoSchema.index({ idEleccion: 1 });
votoAnonimoSchema.index({ idCandidato: 1 });
votoAnonimoSchema.index({ fechaVoto: -1 });

export default mongoose.model('VotoAnonimo', votoAnonimoSchema);