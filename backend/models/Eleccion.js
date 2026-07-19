/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: Eleccion.js
 * UBICACIÓN: /backend/models/Eleccion.js
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CORRECCIÓN:
 * ✅ Eliminado unique: true en campo descripcion
 *    Misma causa que TipoEleccion — ver comentario en TipoEleccion.js
 */

import mongoose from "mongoose";

const eleccionSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título es obligatorio"],
      unique: true,
      trim: true,
      minlength: [5, "El título debe tener al menos 5 caracteres"],
      maxlength: [200, "El título no puede exceder 200 caracteres"],
    },
    descripcion: {
      type: String,
      trim: true,
      // ✅ ELIMINADO unique: true — no tiene sentido en un campo descriptivo
      maxlength: [1000, "La descripción no puede exceder 1000 caracteres"],
    },
    idTipoEleccion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TipoEleccion",
      required: [true, "El tipo de elección es obligatorio"],
    },
    fechaInicio: {
      type: Date,
      required: [true, "La fecha de inicio es obligatoria"],
    },
    fechaFin: {
      type: Date,
      required: [true, "La fecha de fin es obligatoria"],
      validate: {
        validator: function (value) {
          return value > this.fechaInicio;
        },
        message: "La fecha de fin debe ser posterior a la fecha de inicio",
      },
    },
    estado: {
      type: String,
      enum: {
        values: [
          "proxima",
          "abierta_postulacion",
          "en_votacion",
          "finalizada",
          "cancelada",
        ],
        message: "Estado inválido",
      },
      default: "proxima",
    },
    activa: {
      type: Boolean,
      default: true,
    },
    totalVotantes: {
      type: Number,
      default: 0,
      min: [0, "El total de votantes no puede ser negativo"],
    },
    abiertaPostulacion: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

eleccionSchema.index({ activa: 1 });
eleccionSchema.index({ estado: 1 });
eleccionSchema.index({ fechaInicio: 1, fechaFin: 1 });
eleccionSchema.index({ idTipoEleccion: 1 });

eleccionSchema.methods.estaEnCurso = function () {
  const ahora = new Date();
  return (
    ahora >= this.fechaInicio &&
    ahora <= this.fechaFin &&
    this.estado === "en_votacion"
  );
};

eleccionSchema.methods.haFinalizado = function () {
  return this.estado === "finalizada" || new Date() > this.fechaFin;
};

eleccionSchema.methods.aceptaCandidatos = function () {
  return (
    this.abiertaPostulacion &&
    this.activa &&
    this.estado === "abierta_postulacion"
  );
};

eleccionSchema.statics.obtenerActivas = async function () {
  const ahora = new Date();
  return await this.find({
    activa: true,
    fechaInicio: { $lte: ahora },
    fechaFin: { $gte: ahora },
    estado: "en_votacion",
  }).populate("idTipoEleccion");
};

export default mongoose.model("Eleccion", eleccionSchema);
