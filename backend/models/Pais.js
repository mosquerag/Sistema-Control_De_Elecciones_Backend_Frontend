/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: Pais.js
 * UBICACIÓN: /backend/models/Pais.js
 * DESCRIPCIÓN: Modelo de países
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * FUNCIÓN:
 * - Define países del sistema
 * - Permite gestión de nacionalidades
 * 
 * DEPENDE DE:
 * - mongoose (ODM)
 * 
 * ES USADO POR:
 * - paisController.js
 * - Usuario.js (referencia opcional)
 */

import mongoose from 'mongoose';

const paisSchema = new mongoose.Schema(
  {
    /**
     * Nombre del país
     * @required
     */
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      unique: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },

    /**
     * Código ISO del país
     * @optional
     */
    codigo: {
      type: String,
      trim: true,
      uppercase: true,
      minlength: [2, 'El código debe tener 2 caracteres'],
      maxlength: [3, 'El código no puede exceder 3 caracteres'],
    },

    /**
     * Indica si el país está activo
     * @default true
     */
    activa: {
      type: Boolean,
      default: true,
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

paisSchema.index({ nombre: 1 });
paisSchema.index({ codigo: 1 });
paisSchema.index({ activa: 1 });

export default mongoose.model('Pais', paisSchema);