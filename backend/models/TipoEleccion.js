import mongoose from "mongoose";

const tipoEleccionSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      unique: true,
      minlength: [3, "El nombre debe tener al menos 3 caracteres"],
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },
    descripcion: {
      type: String,
      trim: true,
      // ✅ ELIMINADO unique: true — causaba errores con múltiples tipos sin descripción
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
    },
    activa: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

tipoEleccionSchema.index({ activa: 1 });

export default mongoose.model("TipoEleccion", tipoEleccionSchema);
