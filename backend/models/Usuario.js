import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      unique: true,
      minlength: [3, "El nombre debe tener al menos 3 caracteres"],
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },

    cedula: {
      type: String,
      required: [true, "La cédula es obligatoria"],
      sparse: true,
      trim: true,
      validate: {
        validator: function (v) {
          if (this.rol !== "admin" && !v) return false;
          if (v && !/^\d{11}$/.test(v)) return false;
          return true;
        },
        message: "La cédula debe tener exactamente 11 dígitos",
      },
    },

    email: {
      type: String,
      // ✅ NO poner default: null — dejar undefined para que sparse funcione
      sparse: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          if ((this.rol === "admin" || this.esGoogleAuth) && !v) return false;
          if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return false;
          return true;
        },
        message: "Email inválido",
      },
    },

    pais: {
      type: String,
      trim: true,
      default: null,
    },

    password: {
      type: String,
      required: function () {
        return !this.esGoogleAuth;
      },
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    },

    rol: {
      type: String,
      required: [true, "El rol es obligatorio"],
      enum: {
        values: ["admin", "ciudadano", "candidato"],
        message: "Rol inválido. Debe ser: admin, ciudadano o candidato",
      },
    },

    // ✅ perfilPendiente ANTES de fotoPerfil para que el required lo pueda leer
    perfilPendiente: {
      type: Boolean,
      default: false,
    },

    fotoPerfil: {
      type: String,
      default: null,
      required: function () {
        // ✅ Solo obligatoria si se registra por cuenta propia (no admin, no Google)
        return (
          (this.rol === "ciudadano" || this.rol === "candidato") &&
          !this.esGoogleAuth &&
          !this.perfilPendiente
        );
      },
      validate: {
        validator: function (v) {
          if (!v) return true;
          const isBase64 = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(
            v,
          );
          const isURL = /^https?:\/\/.+/i.test(v);
          return isBase64 || isURL;
        },
        message: "Formato de imagen inválido. Debe ser Base64 o URL",
      },
    },

    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },

    esGoogleAuth: {
      type: Boolean,
      default: false,
    },

    estado: {
      type: String,
      enum: [
        "pendiente_aprobacion",
        "pendiente",
        "activo",
        "bloqueado",
        "rechazado",
        "archivado",
      ],
      default: "pendiente_aprobacion",
    },

    activo: {
      type: Boolean,
      default: true,
    },

    motivoRechazo: {
      type: String,
      default: null,
    },

    eliminado: {
      type: Boolean,
      default: false,
    },

    fechaEliminacion: {
      type: Date,
      default: null,
    },

    intentosRegistro: {
      type: Number,
      default: 1,
    },

    historicoEstados: [
      {
        estado: String,
        fecha: { type: Date, default: Date.now },
        adminId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Usuario",
        },
      },
    ],

    fechaRechazo: {
      type: Date,
      default: null,
    },

    rechazadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      default: null,
    },

    fechaAprobacion: {
      type: Date,
      default: null,
    },

    aprobadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      default: null,
    },

    fechaNacimiento: {
      type: Date,
      default: null,
    },

    edad: {
      type: Number,
      default: null,
    },

    nacionalidad: {
      type: String,
      default: "Dominicana",
      trim: true,
    },

    direccion: {
      type: String,
      default: null,
      trim: true,
      maxlength: [200, "La dirección no puede exceder 200 caracteres"],
    },

    municipio: {
      type: String,
      default: null,
      trim: true,
      maxlength: [100, "El municipio no puede exceder 100 caracteres"],
    },

    // telefono: {
    //   type: String,
    //   default: null,
    //   trim: true,
    //   validate: {
    //     validator: function (v) {
    //       if (!v) return true;
    //       return /^\d{10}$/.test(v);
    //     },
    //     message: "El teléfono debe tener 10 dígitos",
    //   },
    // },

    // telefono: {
    //   type: String,
    //   default: null,
    //   trim: true,
    //   validate: {
    //     validator: function (v) {
    //       if (!v) return true;
    //       // Formato E.164: + seguido de 8 a 15 dígitos
    //       return /^\+[1-9]\d{7,14}$/.test(v);
    //     },
    //     message: "El teléfono debe tener un formato internacional válido",
    //   },
    // },

    telefono: {
      type: String,
      default: null,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          // Formato internacional E.164: + seguido de 8 a 15 dígitos
          return /^\+[1-9]\d{7,14}$/.test(v);
        },
        message: "El teléfono debe tener un formato internacional válido",
      },
    },

    partido: {
      type: String,
      required: function () {
        return this.rol === "candidato" && !this.perfilPendiente;
      },
      trim: true,
      maxlength: [100, "El nombre del partido no puede exceder 100 caracteres"],
    },

    propuestas: {
      type: String,
      required: function () {
        return this.rol === "candidato" && !this.perfilPendiente;
      },
      trim: true,
      maxlength: [2000, "Las propuestas no pueden exceder 2000 caracteres"],
    },

    idEleccion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Eleccion",
      required: function () {
        return this.rol === "candidato" && !this.perfilPendiente;
      },
    },

    totalVotos: {
      type: Number,
      default: 0,
      min: [0, "Los votos no pueden ser negativos"],
    },
    // ── Reset de contraseña ──────────────────────────────────
    passwordResetBlockedUntil: {
      type: Date,
      default: null,
    },

    passwordResetTokenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// ═══════════════════════════════════════════════════════════════════════
// ÍNDICES
// ✅ sparse: true hace que MongoDB ignore documentos donde el campo
//    es undefined (no null). Por eso en los controllers usamos
//    undefined en lugar de null para email cuando no aplica.
// ═══════════════════════════════════════════════════════════════════════

usuarioSchema.index({ cedula: 1 }, { unique: true, sparse: true });
usuarioSchema.index({ email: 1 }, { unique: true, sparse: true });
usuarioSchema.index({ googleId: 1 }, { unique: true, sparse: true });
usuarioSchema.index({ rol: 1, estado: 1 });
usuarioSchema.index({ idEleccion: 1, rol: 1 });

// ═══════════════════════════════════════════════════════════════════════
// MÉTODOS DE INSTANCIA
// ═══════════════════════════════════════════════════════════════════════

usuarioSchema.methods.puedeIniciarSesion = function () {
  return this.estado === "activo" && this.activo === true;
};

usuarioSchema.methods.estaPendiente = function () {
  return this.estado === "pendiente_aprobacion";
};

usuarioSchema.methods.fueRechazado = function () {
  return this.estado === "rechazado";
};

usuarioSchema.methods.estaBloqueado = function () {
  return this.estado === "bloqueado";
};

usuarioSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.googleId;
  return obj;
};

// ═══════════════════════════════════════════════════════════════════════
// MÉTODOS ESTÁTICOS
// ═══════════════════════════════════════════════════════════════════════

usuarioSchema.statics.findByEmailOrCedula = async function (identifier) {
  return await this.findOne({
    $or: [{ email: identifier }, { cedula: identifier }],
  });
};

usuarioSchema.statics.obtenerPendientes = async function (tipo = null) {
  const query = { estado: "pendiente_aprobacion" };
  if (tipo) {
    query.rol = tipo;
  } else {
    query.rol = { $in: ["ciudadano", "candidato"] };
  }
  return await this.find(query).select("-password").sort({ createdAt: -1 });
};

usuarioSchema.statics.contarPorEstado = async function () {
  const resultados = await this.aggregate([
    { $group: { _id: "$estado", total: { $sum: 1 } } },
  ]);
  return resultados.reduce((acc, curr) => {
    acc[curr._id] = curr.total;
    return acc;
  }, {});
};

// ═══════════════════════════════════════════════════════════════════════
// MÉTODOS DE SOFT DELETE
// ═══════════════════════════════════════════════════════════════════════

usuarioSchema.methods.softDelete = async function (adminId) {
  this.eliminado = true;
  this.fechaEliminacion = new Date();
  this.estado = "rechazado";
  this.activo = false;
  this.fechaRechazo = new Date();
  this.rechazadoPor = adminId;
  this.historicoEstados.push({
    estado: "rechazado",
    fecha: new Date(),
    adminId,
  });
  await this.save();
};

usuarioSchema.methods.restaurar = async function (adminId) {
  this.eliminado = false;
  this.fechaEliminacion = null;
  this.estado = "activo";
  this.activo = true;
  this.motivoRechazo = null;
  this.fechaRechazo = null;
  this.rechazadoPor = null;
  this.historicoEstados.push({
    estado: "restaurado",
    fecha: new Date(),
    adminId,
  });
  await this.save();
};

// ═══════════════════════════════════════════════════════════════════════
// MIDDLEWARE PRE-FIND — Excluir eliminados por defecto
// ═══════════════════════════════════════════════════════════════════════

usuarioSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ eliminado: { $ne: true } });
  }
  next();
});

// ═══════════════════════════════════════════════════════════════════════
// MIDDLEWARE PRE-SAVE
// ═══════════════════════════════════════════════════════════════════════

usuarioSchema.pre("save", function (next) {
  if (this.fechaNacimiento) {
    const hoy = new Date();
    let edad = hoy.getFullYear() - this.fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - this.fechaNacimiento.getMonth();
    if (
      mes < 0 ||
      (mes === 0 && hoy.getDate() < this.fechaNacimiento.getDate())
    ) {
      edad--;
    }
    this.edad = edad;
  }
  next();
});

export default mongoose.model("Usuario", usuarioSchema);
