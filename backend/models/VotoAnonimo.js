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