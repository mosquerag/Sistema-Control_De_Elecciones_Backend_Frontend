/**
 * ═══════════════════════════════════════════════════════════════════════
 * ARCHIVO: authController.js
 * UBICACIÓN: /backend/controllers/authController.js
 * DESCRIPCIÓN: Controlador de autenticación — limpio y seguro
 * ═══════════════════════════════════════════════════════════════════════
 *
 * MEJORAS APLICADAS:
 * ✅ Eliminados todos los console.log de producción
 * ✅ Respuestas consistentes con { success, message, data }
 * ✅ Tokens con expiración apropiada
 * ✅ Cookies seguras configuradas para producción
 * ✅ Validaciones de campos obligatorios
 * ✅ Manejo correcto de perfilPendiente para usuarios creados por admin
 */

import Usuario from "../models/Usuario.js";
import Notificacion from "../models/Notificacion.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Genera access token JWT (15 minutos en producción, 24h en desarrollo)
 */
const generarAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: isProduction ? "15m" : "24h",
  });

/**
 * Genera refresh token JWT (7 días)
 */
const generarRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

/**
 * Configura cookie de acceso en la respuesta
 */
const setCookieToken = (res, token) => {
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: isProduction ? 15 * 60 * 1000 : 24 * 60 * 60 * 1000,
    path: "/",
  });
};

/**
 * Configura cookie httpOnly para el refresh token
 * Path restringido a /api/auth para que solo se envíe en esas rutas
 */
const setRefreshCookie = (res, token) => {
  res.cookie("refresh_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    path: "/api/auth",
  });
};

/**
 * Construye el objeto seguro del usuario (sin password)
 */
const buildUserResponse = (usuario) => ({
  _id: usuario._id,
  nombre: usuario.nombre,
  email: usuario.email,
  cedula: usuario.cedula,
  rol: usuario.rol,
  estado: usuario.estado,
  activo: usuario.activo,
  fotoPerfil: usuario.fotoPerfil,
  perfilPendiente: usuario.perfilPendiente || false,
  esGoogleAuth: usuario.esGoogleAuth || false,
  idEleccion: usuario.idEleccion,
  partido: usuario.partido,
  fechaNacimiento: usuario.fechaNacimiento,
  edad: usuario.edad,
  municipio: usuario.municipio,
  direccion: usuario.direccion,
  telefono: usuario.telefono,
  nacionalidad: usuario.nacionalidad,
});

// ═══════════════════════════════════════════════════════════════════════
// REGISTRO PÚBLICO — ADMIN
// ═══════════════════════════════════════════════════════════════════════

// export const registerAdmin = async (req, res) => {
//   try {
//     const { nombre, email, password, fotoPerfil, fechaNacimiento, cedula } =
//       req.body;

//     console.log("🔵 [ADMIN] Iniciando registro...");

//     if (!nombre || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Nombre, email y contraseña son obligatorios.",
//         error: "MISSING_FIELDS",
//       });
//     }

//     if (!/^\d{11}$/.test(cedula)) {
//       return res.status(400).json({
//         success: false,
//         message: "La cédula debe tener exactamente 11 dígitos",
//         error: "INVALID_CEDULA",
//         campo: "cedula",
//       });
//     }

//     const existeCedula = await Usuario.findOne({ cedula: cedula.trim() });
//     if (existeCedula) {
//       return res.status(400).json({
//         success: false,
//         message: "La cédula ya está registrada en el sistema",
//         error: "CEDULA_EXISTS",
//         campo: "cedula",
//       });
//     }

//     // ✅ FIX ZONA HORARIA
//     let fechaNacUTC = null;
//     if (fechaNacimiento) {
//       fechaNacUTC = normalizarFechaUTC(fechaNacimiento);

//       if (isNaN(fechaNacUTC.getTime())) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message: "Fecha de nacimiento inválida",
//             error: "INVALID_DATE",
//             campo: "fechaNacimiento",
//           });
//       }
//       if (fechaNacUTC > new Date()) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message: "La fecha de nacimiento no puede ser futura",
//             error: "FUTURE_DATE",
//             campo: "fechaNacimiento",
//           });
//       }

//       const edad = calcularEdad(fechaNacUTC);
//       if (edad < 18) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message: `Debes ser mayor de 18 años. Tu edad: ${edad} años`,
//             error: "UNDERAGE",
//             campo: "fechaNacimiento",
//             edad,
//           });
//       }
//       if (edad > 120) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message: "Por favor verifica la fecha de nacimiento",
//             error: "INVALID_AGE",
//             campo: "fechaNacimiento",
//           });
//       }
//     }

//     const nombreExiste = await Usuario.findOne({
//       nombre: { $regex: new RegExp(`^${nombre.trim()}$`, "i") },
//     });
//     if (nombreExiste) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: `El nombre "${nombre}" ya está registrado`,
//           error: "NOMBRE_EXISTS",
//           campo: "nombre",
//         });
//     }

//     const existeEmail = await Usuario.findOne({
//       email: email.toLowerCase().trim(),
//     });
//     if (existeEmail) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "El email ya está registrado",
//           error: "EMAIL_EXISTS",
//           campo: "email",
//         });
//     }

//     const salt = bcryptjs.genSaltSync(10);
//     const hashedPassword = bcryptjs.hashSync(password, salt);

//     const nuevoAdmin = new Usuario({
//       nombre: nombre.trim(),
//       email: email.toLowerCase().trim(),
//       cedula: cedula.trim(),
//       password: hashedPassword,
//       rol: "admin",
//       fotoPerfil: fotoPerfil || null,
//       fechaNacimiento: fechaNacUTC,
//       estado: "activo",
//       activo: true,
//     });

//     await nuevoAdmin.save();
//     console.log("✅ Admin creado exitosamente");

//     await Log.create({
//       accion: "registro",
//       tipoUsuario: "admin",
//       idUsuario: nuevoAdmin._id,
//       detalles: { nombre, email, cedula },
//       ipAddress: req.ip,
//       userAgent: req.headers["user-agent"],
//       resultado: "exito",
//       severidad: "info",
//     });

//     const accessToken = generarAccessToken(nuevoAdmin);
//     const refreshToken = generarRefreshToken(nuevoAdmin);
//     configurarCookie(res, accessToken);

//     const { password: _, ...adminSinPassword } = nuevoAdmin._doc;

//     res.status(201).json({
//       success: true,
//       message: "Administrador registrado exitosamente",
//       data: { usuario: adminSinPassword, accessToken, refreshToken },
//     });
//   } catch (error) {
//     console.error("💥 Error en registerAdmin:", error);
//     if (error.code === 11000) {
//       const campo = Object.keys(error.keyPattern)[0];
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: `Ya existe un usuario con ese ${campo}`,
//           error: "DUPLICATE_KEY",
//           campo,
//         });
//     }
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Error al registrar administrador",
//         error: error.message,
//       });
//   }
// };

export const registerAdmin = async (req, res) => {
  try {
    const { nombre, email, password, cedula, fotoPerfil, fechaNacimiento } =
      req.body;

    if (!nombre || !email || !password || !cedula) {
      return res.status(400).json({
        success: false,
        message: "Nombre, email, contraseña y cédula son obligatorios.",
        error: "MISSING_FIELDS",
      });
    }

    const existeEmail = await Usuario.findOne({ email });
    if (existeEmail) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado.",
        error: "EMAIL_EXISTS",
      });
    }

    const existeCedula = await Usuario.findOne({ cedula });
    if (existeCedula) {
      return res.status(400).json({
        success: false,
        message: "La cédula ya está registrada.",
        error: "CEDULA_EXISTS",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nuevoAdmin = new Usuario({
      nombre,
      email,
      cedula,
      password: hashedPassword,
      fotoPerfil: fotoPerfil || null,
      fechaNacimiento: fechaNacimiento || null,
      rol: "admin",
      estado: "activo",
      activo: true,
    });

    await nuevoAdmin.save();

    return res.status(201).json({
      success: true,
      message: "Administrador registrado exitosamente.",
    });
  } catch (error) {
    console.error("Error en registerAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Error al registrar administrador.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// REGISTRO PÚBLICO — CIUDADANO
// ═══════════════════════════════════════════════════════════════════════

// export const registerCiudadano = async (req, res) => {
//   try {
//     console.log("🔵 [CIUDADANO] Iniciando registro...");

//     const {
//       nombre,
//       cedula,
//       email,
//       password,
//       fotoPerfil,
//       fechaNacimiento,
//       direccion,
//       municipio,
//       telefono,
//     } = req.body;

//     if (!nombre || !cedula || !password || !fotoPerfil) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Nombre, cédula, contraseña y foto de perfil son obligatorios.",
//         error: "MISSING_FIELDS",
//       });
//     }

//     const nombreExiste = await Usuario.findOne({
//       nombre: { $regex: new RegExp(`^${nombre.trim()}$`, "i") },
//     });
//     if (nombreExiste) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: `El nombre "${nombre}" ya está registrado`,
//           error: "NOMBRE_EXISTS",
//           campo: "nombre",
//         });
//     }

//     const existeCedula = await Usuario.findOne({ cedula: cedula.trim() });
//     if (existeCedula) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "La cédula ya está registrada.",
//           error: "CEDULA_EXISTS",
//           campo: "cedula",
//         });
//     }

//     if (email) {
//       const existeEmail = await Usuario.findOne({
//         email: email.toLowerCase().trim(),
//       });
//       if (existeEmail) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message: "El email ya está registrado.",
//             error: "EMAIL_EXISTS",
//             campo: "email",
//           });
//       }
//     }

//     // ✅ FIX ZONA HORARIA
//     const fechaNacUTC = fechaNacimiento
//       ? normalizarFechaUTC(fechaNacimiento)
//       : null;

//     const salt = bcryptjs.genSaltSync(10);
//     const hashedPassword = bcryptjs.hashSync(password, salt);

//     const nuevoCiudadano = new Usuario({
//       nombre: nombre.trim(),
//       cedula: cedula.trim(),
//       email: email ? email.toLowerCase().trim() : null,
//       password: hashedPassword,
//       rol: "ciudadano",
//       fotoPerfil,
//       fechaNacimiento: fechaNacUTC,
//       direccion: direccion || null,
//       municipio: municipio || null,
//       telefono: telefono || null,
//       estado: "pendiente_aprobacion",
//       activo: true,
//     });

//     await nuevoCiudadano.save();
//     console.log("✅ Ciudadano guardado:", nuevoCiudadano._id);

//     try {
//       await Notificacion.crearNotificacionRegistro(
//         nuevoCiudadano,
//         "tradicional",
//       );
//     } catch (e) {
//       console.log("⚠️", e.message);
//     }
//     try {
//       await Log.create({
//         accion: "registro",
//         tipoUsuario: "ciudadano",
//         idUsuario: nuevoCiudadano._id,
//         detalles: { nombre, cedula, email },
//         ipAddress: req.ip,
//         userAgent: req.headers["user-agent"],
//         resultado: "exito",
//         severidad: "info",
//       });
//     } catch (e) {
//       console.log("⚠️", e.message);
//     }

//     res.status(201).json({
//       success: true,
//       message: "Registro exitoso. Tu cuenta está pendiente de aprobación.",
//       data: {
//         usuario: {
//           nombre: nuevoCiudadano.nombre,
//           cedula: nuevoCiudadano.cedula,
//           estado: nuevoCiudadano.estado,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("💥 ERROR en registerCiudadano:", error);
//     if (error.code === 11000) {
//       const campo = Object.keys(error.keyPattern)[0];
//       const mensajes = {
//         nombre: "Ya existe un usuario con ese nombre",
//         cedula: "Ya existe un usuario con esa cédula",
//         email: "Ya existe un usuario con ese email",
//       };
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: mensajes[campo] || "Este registro ya existe",
//           error: "DUPLICATE_KEY",
//           campo,
//         });
//     }
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Error al registrar ciudadano.",
//         error: error.message,
//       });
//   }
// };

export const registerCiudadano = async (req, res) => {
  try {
    const {
      nombre,
      cedula,
      email,
      password,
      fotoPerfil,
      fechaNacimiento,
      edad,
      telefono,
      municipio,
      direccion,
      nacionalidad,
      pais,
    } = req.body;

    // if (!nombre || !cedula) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Nombre y cédula son obligatorios.",
    //     error: "MISSING_FIELDS",
    //   });
    // }

    if (!nombre || !cedula || !password) {
      return res.status(400).json({
        success: false,
        message: "Nombre, cédula y contraseña son obligatorios.",
        error: "MISSING_FIELDS",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 8 caracteres.",
        error: "WEAK_PASSWORD",
      });
    }

    const existeCedula = await Usuario.findOne({ cedula });
    if (existeCedula) {
      return res.status(400).json({
        success: false,
        message: "La cédula ya está registrada.",
        error: "CEDULA_EXISTS",
      });
    }

    if (email) {
      const existeEmail = await Usuario.findOne({ email });
      if (existeEmail) {
        return res.status(400).json({
          success: false,
          message: "El email ya está registrado.",
          error: "EMAIL_EXISTS",
        });
      }
    }

    const ciudadanoData = {
      nombre,
      cedula,
      rol: "ciudadano",
      estado: "pendiente_aprobacion",
      fechaNacimiento: fechaNacimiento || null,
      edad: edad || null,
      nacionalidad: nacionalidad || null,
      telefono: telefono || null,
      municipio: municipio || null,
      direccion: direccion || null,
      pais: pais || null,
    };

    if (email) ciudadanoData.email = email;
    if (fotoPerfil) ciudadanoData.fotoPerfil = fotoPerfil;

    // if (password) {
    //   const salt = await bcrypt.genSalt(12);
    //   ciudadanoData.password = await bcrypt.hash(password, salt);
    // }

    const salt = await bcrypt.genSalt(12);
    ciudadanoData.password = await bcrypt.hash(password, salt);

    const nuevoCiudadano = new Usuario(ciudadanoData);
    await nuevoCiudadano.save();

    // Notificar a admins
    await Notificacion.create({
      tipo: "nuevo_registro",
      tipoUsuario: "ciudadano",
      idUsuario: nuevoCiudadano._id,
      mensaje: `Nuevo ciudadano registrado: ${nombre}`,
      datos: { nombre, cedula, email, rol: "ciudadano" },
      visible: true,
      procesada: false,
      prioridad: "media",
    });

    return res.status(201).json({
      success: true,
      message:
        "Registro exitoso. Tu cuenta está pendiente de aprobación por un administrador.",
    });
  } catch (error) {
    console.error("Error en registerCiudadano:", error);
    return res.status(500).json({
      success: false,
      message: "Error al registrar ciudadano.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// REGISTRO PÚBLICO — CANDIDATO
// ═══════════════════════════════════════════════════════════════════════

// export const registerCandidato = async (req, res) => {
//   try {
//     const {
//       nombre,
//       cedula,
//       email,
//       password,
//       fotoPerfil,
//       partido,
//       propuestas,
//       idEleccion,
//       telefono,
//       fechaNacimiento,
//     } = req.body;

//     console.log("🔵 [CANDIDATO] Iniciando registro...");

//     if (
//       !nombre ||
//       !cedula ||
//       !password ||
//       !fotoPerfil ||
//       !partido ||
//       !propuestas ||
//       !idEleccion
//     ) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "Todos los campos son obligatorios para candidatos",
//           error: "MISSING_FIELDS",
//         });
//     }

//     if (!fechaNacimiento) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "La fecha de nacimiento es obligatoria",
//           error: "MISSING_BIRTHDATE",
//           campo: "fechaNacimiento",
//         });
//     }

//     // ✅ FIX ZONA HORARIA
//     const fechaNacUTC = normalizarFechaUTC(fechaNacimiento);

//     if (isNaN(fechaNacUTC.getTime())) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "Fecha de nacimiento inválida",
//           error: "INVALID_DATE",
//           campo: "fechaNacimiento",
//         });
//     }
//     if (fechaNacUTC > new Date()) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "La fecha de nacimiento no puede ser futura",
//           error: "FUTURE_DATE",
//           campo: "fechaNacimiento",
//         });
//     }

//     const edad = calcularEdad(fechaNacUTC);
//     if (edad < 18) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: `Debes ser mayor de 18 años. Tu edad: ${edad}`,
//           error: "UNDERAGE",
//           campo: "fechaNacimiento",
//           edad,
//         });
//     }
//     if (edad > 120) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "Por favor verifica la fecha de nacimiento",
//           error: "INVALID_AGE",
//           campo: "fechaNacimiento",
//         });
//     }

//     const nombreExiste = await Usuario.findOne({
//       nombre: { $regex: new RegExp(`^${nombre.trim()}$`, "i") },
//     });
//     if (nombreExiste) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: `El nombre "${nombre}" ya está registrado`,
//           error: "NOMBRE_EXISTS",
//           campo: "nombre",
//         });
//     }

//     const existeCedula = await Usuario.findOne({ cedula: cedula.trim() });
//     if (existeCedula) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "La cédula ya está registrada",
//           error: "CEDULA_EXISTS",
//           campo: "cedula",
//         });
//     }

//     if (email) {
//       const existeEmail = await Usuario.findOne({
//         email: email.toLowerCase().trim(),
//       });
//       if (existeEmail) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message: "El email ya está registrado",
//             error: "EMAIL_EXISTS",
//             campo: "email",
//           });
//       }
//     }

//     const salt = bcryptjs.genSaltSync(10);
//     const hashedPassword = bcryptjs.hashSync(password, salt);

//     const nuevoCandidato = new Usuario({
//       nombre: nombre.trim(),
//       cedula: cedula.trim(),
//       email: email ? email.toLowerCase().trim() : null,
//       password: hashedPassword,
//       rol: "candidato",
//       fotoPerfil,
//       partido,
//       propuestas,
//       idEleccion,
//       telefono: telefono || null,
//       fechaNacimiento: fechaNacUTC,
//       edad,
//       estado: "pendiente_aprobacion",
//       activo: true,
//       totalVotos: 0,
//     });

//     await nuevoCandidato.save();
//     console.log("✅ Candidato creado exitosamente");

//     await Notificacion.crearNotificacionRegistro(nuevoCandidato, "tradicional");
//     await Log.create({
//       accion: "registro",
//       tipoUsuario: "candidato",
//       idUsuario: nuevoCandidato._id,
//       detalles: { nombre, cedula, email, partido, idEleccion, edad },
//       ipAddress: req.ip,
//       userAgent: req.headers["user-agent"],
//       resultado: "exito",
//       severidad: "info",
//     });

//     res.status(201).json({
//       success: true,
//       message:
//         "Postulación exitosa. Tu candidatura está pendiente de aprobación",
//       data: {
//         candidato: {
//           nombre: nuevoCandidato.nombre,
//           cedula: nuevoCandidato.cedula,
//           partido: nuevoCandidato.partido,
//           edad: nuevoCandidato.edad,
//           estado: nuevoCandidato.estado,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("💥 Error en registerCandidato:", error);
//     if (error.code === 11000) {
//       const campo = Object.keys(error.keyPattern)[0];
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: `Ya existe un usuario con ese ${campo}`,
//           error: "DUPLICATE_KEY",
//           campo,
//         });
//     }
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Error al registrar candidato",
//         error: error.message,
//       });
//   }
// };

export const registerCandidato = async (req, res) => {
  try {
    const {
      nombre,
      cedula,
      email,
      password,
      partido,
      propuestas,
      idEleccion,
      fotoPerfil,
      fechaNacimiento,
      municipio,
      pais,
    } = req.body;

    // if (!nombre || !cedula || !partido || !propuestas || !idEleccion) {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "Nombre, cédula, partido, propuestas y elección son obligatorios.",
    //     error: "MISSING_FIELDS",
    //   });
    // }

    if (
      !nombre ||
      !cedula ||
      !partido ||
      !propuestas ||
      !idEleccion ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Nombre, cédula, partido, propuestas, elección y contraseña son obligatorios.",
        error: "MISSING_FIELDS",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 8 caracteres.",
        error: "WEAK_PASSWORD",
      });
    }

    const existeCedula = await Usuario.findOne({ cedula });
    if (existeCedula) {
      return res.status(400).json({
        success: false,
        message: "La cédula ya está registrada.",
        error: "CEDULA_EXISTS",
      });
    }

    const candidatoData = {
      nombre,
      cedula,
      partido,
      propuestas,
      idEleccion,
      rol: "candidato",
      estado: "pendiente_aprobacion",
      fechaNacimiento: fechaNacimiento || null,
      municipio: municipio || null,
      pais: pais || null,
    };

    if (email) candidatoData.email = email;
    if (fotoPerfil) candidatoData.fotoPerfil = fotoPerfil;

    // if (password) {
    //   const salt = await bcrypt.genSalt(12);
    //   candidatoData.password = await bcrypt.hash(password, salt);
    // }

    const salt = await bcrypt.genSalt(12);
    candidatoData.password = await bcrypt.hash(password, salt);

    const nuevoCandidato = new Usuario(candidatoData);
    await nuevoCandidato.save();

    await Notificacion.create({
      tipo: "nueva_postulacion",
      tipoUsuario: "candidato",
      idUsuario: nuevoCandidato._id,
      mensaje: `Nueva postulación de candidato: ${nombre}`,
      datos: { nombre, cedula, partido, idEleccion, email },
      visible: true,
      procesada: false,
      prioridad: "alta",
    });

    return res.status(201).json({
      success: true,
      message: "Postulación registrada exitosamente. Pendiente de aprobación.",
    });
  } catch (error) {
    console.error("Error en registerCandidato:", error);
    return res.status(500).json({
      success: false,
      message: "Error al registrar candidato.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// REGISTRO POR ADMIN — ADMIN, CIUDADANO, CANDIDATO
// ═══════════════════════════════════════════════════════════════════════

// export const registerAdminByAdmin = async (req, res) => {
//   try {
//     const { nombre, cedula, fechaNacimiento, email, fotoPerfil } = req.body;

//     console.log("🔵 [ADMIN→ADMIN] Registro por admin...");

//     if (!nombre || !cedula || !email) {
//       return res.status(400).json({
//         success: false,
//         message: "Nombre, cédula y email son obligatorios",
//         error: "MISSING_FIELDS",
//       });
//     }

//     if (!/^\d{11}$/.test(cedula)) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "La cédula debe tener exactamente 11 dígitos",
//           error: "INVALID_CEDULA",
//           campo: "cedula",
//         });
//     }

//     const existeCedula = await Usuario.findOne({ cedula: cedula.trim() });
//     if (existeCedula) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "La cédula ya está registrada",
//           error: "CEDULA_EXISTS",
//           campo: "cedula",
//         });
//     }

//     const existeEmail = await Usuario.findOne({
//       email: email.toLowerCase().trim(),
//     });
//     if (existeEmail) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "El email ya está registrado",
//           error: "EMAIL_EXISTS",
//           campo: "email",
//         });
//     }

//     const nombreExiste = await Usuario.findOne({
//       nombre: { $regex: new RegExp(`^${nombre.trim()}$`, "i") },
//     });
//     if (nombreExiste) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: `El nombre "${nombre}" ya está registrado`,
//           error: "NOMBRE_EXISTS",
//           campo: "nombre",
//         });
//     }

//     let fechaNacUTC = null;
//     if (fechaNacimiento) {
//       fechaNacUTC = normalizarFechaUTC(fechaNacimiento);
//       if (isNaN(fechaNacUTC.getTime())) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message: "Fecha de nacimiento inválida",
//             error: "INVALID_DATE",
//             campo: "fechaNacimiento",
//           });
//       }
//       const edad = calcularEdad(fechaNacUTC);
//       if (edad < 18) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message: `El administrador debe ser mayor de 18 años. Edad: ${edad}`,
//             error: "UNDERAGE",
//             campo: "fechaNacimiento",
//           });
//       }
//     }

//     // Contraseña temporal = cédula
//     const salt = bcryptjs.genSaltSync(10);
//     const hashedPassword = bcryptjs.hashSync(cedula.trim(), salt);

//     const nuevoAdmin = new Usuario({
//       nombre: nombre.trim(),
//       email: email.toLowerCase().trim(),
//       cedula: cedula.trim(),
//       password: hashedPassword,
//       rol: "admin",
//       fotoPerfil: fotoPerfil || null,
//       fechaNacimiento: fechaNacUTC,
//       // ✅ Activo directamente — sin aprobación
//       estado: "activo",
//       activo: true,
//     });

//     await nuevoAdmin.save();
//     console.log("✅ Admin creado por admin:", nuevoAdmin._id);

//     // ✅ Sin notificación — registrado por admin no necesita aprobación
//     await Log.create({
//       accion: "registro_por_admin",
//       // tipoUsuario: "admin",
//       // idUsuario: nuevoAdmin._id,
//       // detalles: { nombre, email, cedula, creadoPor: req.user?._id },
//       tipoUsuario: "admin", // cambia según cada función: "admin", "ciudadano" o "candidato"
//       idUsuario: nuevoAdmin._id, // cambia según: nuevoAdmin, nuevoCiudadano, nuevoCandidato
//       detalles: { nombre, email, cedula, creadoPor: req.user?._id },
//       ipAddress: req.ip,
//       userAgent: req.headers["user-agent"],
//       resultado: "exito",
//       severidad: "info",
//     });

//     const { password: _, ...adminSinPassword } = nuevoAdmin._doc;

//     res.status(201).json({
//       success: true,
//       message: `Administrador "${nombre}" creado exitosamente. La contraseña temporal es la cédula: ${cedula}`,
//       data: { usuario: adminSinPassword },
//     });
//   } catch (logError) {
//     // El log falla pero el registro ya fue exitoso — no interrumpir
//     console.log("⚠️ Error al crear log (no crítico):", logError.message);
//   }
//   // catch (error) {
//   //   console.error("💥 Error en registerAdminByAdmin:", error);
//   //   if (error.code === 11000) {
//   //     const campo = Object.keys(error.keyPattern)[0];
//   //     return res.status(400).json({ success: false, message: `Ya existe un usuario con ese ${campo}`, error: "DUPLICATE_KEY", campo });
//   //   }
//   //   res.status(500).json({ success: false, message: "Error al registrar administrador", error: error.message });
//   // }
// };

export const registerAdminByAdmin = async (req, res) => {
  try {
    const { nombre, email, cedula, fotoPerfil, fechaNacimiento } = req.body;

    if (!nombre || !cedula || !email) {
      return res.status(400).json({
        success: false,
        message: "Nombre, cédula y email son obligatorios.",
        error: "MISSING_FIELDS",
      });
    }

    const [existeCedula, existeEmail] = await Promise.all([
      Usuario.findOne({ cedula }),
      Usuario.findOne({ email }),
    ]);

    if (existeCedula) {
      return res.status(400).json({
        success: false,
        message: "La cédula ya está registrada.",
        error: "CEDULA_EXISTS",
      });
    }
    if (existeEmail) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado.",
        error: "EMAIL_EXISTS",
      });
    }

    // Contraseña temporal = cédula
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(cedula, salt);

    const nuevoAdmin = new Usuario({
      nombre,
      email,
      cedula,
      password: hashedPassword,
      fotoPerfil: fotoPerfil || null,
      fechaNacimiento: fechaNacimiento || null,
      rol: "admin",
      estado: "activo",
      activo: true,
      perfilPendiente: true, // Debe cambiar contraseña al primer login
    });

    await nuevoAdmin.save();

    return res.status(201).json({
      success: true,
      message: `Admin "${nombre}" creado. Contraseña temporal: su cédula.`,
    });
  } catch (error) {
    console.error("Error en registerAdminByAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Error al crear administrador.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

// export const registerCiudadanoByAdmin = async (req, res) => {
//   try {
//     const { nombre, cedula, fechaNacimiento, nacionalidad } = req.body;

//     console.log("🔵 [ADMIN→CIUDADANO] Registro por admin...");

//     if (!nombre || !cedula || !fechaNacimiento) {
//       return res.status(400).json({
//         success: false,
//         message: "Nombre, cédula y fecha de nacimiento son obligatorios",
//         error: "MISSING_FIELDS",
//       });
//     }

//     if (!/^\d{11}$/.test(cedula)) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "La cédula debe tener exactamente 11 dígitos",
//           error: "INVALID_CEDULA",
//           campo: "cedula",
//         });
//     }

//     const existeCedula = await Usuario.findOne({ cedula: cedula.trim() });
//     if (existeCedula) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "La cédula ya está registrada",
//           error: "CEDULA_EXISTS",
//           campo: "cedula",
//         });
//     }

//     const nombreExiste = await Usuario.findOne({
//       nombre: { $regex: new RegExp(`^${nombre.trim()}$`, "i") },
//     });
//     if (nombreExiste) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: `El nombre "${nombre}" ya está registrado`,
//           error: "NOMBRE_EXISTS",
//           campo: "nombre",
//         });
//     }

//     const fechaNacUTC = normalizarFechaUTC(fechaNacimiento);
//     if (isNaN(fechaNacUTC.getTime())) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "Fecha de nacimiento inválida",
//           error: "INVALID_DATE",
//           campo: "fechaNacimiento",
//         });
//     }
//     if (fechaNacUTC > new Date()) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "La fecha de nacimiento no puede ser futura",
//           error: "FUTURE_DATE",
//           campo: "fechaNacimiento",
//         });
//     }

//     const edad = calcularEdad(fechaNacUTC);
//     if (edad < 18) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: `El ciudadano debe ser mayor de 18 años. Edad: ${edad}`,
//           error: "UNDERAGE",
//           campo: "fechaNacimiento",
//         });
//     }

//     // Contraseña placeholder — login ciudadano usa cédula+fechaNac, no password
//     const salt = bcryptjs.genSaltSync(10);
//     const hashedPassword = bcryptjs.hashSync(cedula.trim(), salt);

//     // const nuevoCiudadano = new Usuario({
//     //   nombre: nombre.trim(),
//     //   cedula: cedula.trim(),
//     //   password: hashedPassword,
//     //   rol: "ciudadano",
//     //   nacionalidad: nacionalidad || "Dominicana",
//     //   fechaNacimiento: fechaNacUTC,
//     //   edad,
//     //   fotoPerfil: null,
//     //   email: null,
//     //   telefono: null,
//     //   municipio: null,
//     //   direccion: null,
//     //   // ✅ Activo directamente — sin aprobación
//     //   estado: "activo",
//     //   activo: true,
//     // });
//     const nuevoCiudadano = new Usuario({
//       nombre: nombre.trim(),
//       cedula: cedula.trim(),
//       password: hashedPassword,
//       rol: "ciudadano",
//       nacionalidad: nacionalidad || "Dominicana",
//       fechaNacimiento: fechaNacUTC,
//       edad,
//       fotoPerfil: undefined, // ✅ undefined, no null
//       email: undefined, // ✅ undefined, no null
//       telefono: undefined, // ✅ undefined, no null
//       municipio: undefined, // ✅ undefined, no null
//       direccion: undefined, // ✅ undefined, no null
//       estado: "activo",
//       activo: true,
//       perfilPendiente: true,
//     });

//     await nuevoCiudadano.save();
//     console.log("✅ Ciudadano creado por admin:", nuevoCiudadano._id);

//     // ✅ Sin notificación — registrado por admin no necesita aprobación
//     await Log.create({
//       accion: "registro_por_admin",
//       tipoUsuario: "ciudadano",
//       idUsuario: nuevoCiudadano._id,
//       detalles: { nombre, cedula, creadoPor: req.user?._id },
//       ipAddress: req.ip,
//       userAgent: req.headers["user-agent"],
//       resultado: "exito",
//       severidad: "info",
//     });

//     const { password: _, ...ciudadanoSinPassword } = nuevoCiudadano._doc;

//     res.status(201).json({
//       success: true,
//       message: `Ciudadano "${nombre}" registrado exitosamente. Al iniciar sesión deberá completar su perfil.`,
//       data: { usuario: ciudadanoSinPassword },
//     });
//   } catch (error) {
//     console.error("💥 Error en registerCiudadanoByAdmin:", error);
//     if (error.code === 11000) {
//       const campo = Object.keys(error.keyPattern)[0];
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: `Ya existe un usuario con ese ${campo}`,
//           error: "DUPLICATE_KEY",
//           campo,
//         });
//     }
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Error al registrar ciudadano",
//         error: error.message,
//       });
//   }
// };

export const registerCiudadanoByAdmin = async (req, res) => {
  try {
    const { nombre, cedula, fechaNacimiento } = req.body;

    if (!nombre || !cedula) {
      return res.status(400).json({
        success: false,
        message: "Nombre y cédula son obligatorios.",
        error: "MISSING_FIELDS",
      });
    }

    const existeCedula = await Usuario.findOne({ cedula });
    if (existeCedula) {
      return res.status(400).json({
        success: false,
        message: "La cédula ya está registrada.",
        error: "CEDULA_EXISTS",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(cedula, salt);

    const nuevoCiudadano = new Usuario({
      nombre,
      cedula,
      password: hashedPassword, // ← agregar
      fechaNacimiento: fechaNacimiento || null,
      rol: "ciudadano",
      estado: "activo",
      activo: true,
      perfilPendiente: true,
    });

    // const nuevoCiudadano = new Usuario({
    //   nombre,
    //   cedula,
    //   fechaNacimiento: fechaNacimiento || null,
    //   rol: "ciudadano",
    //   estado: "activo",
    //   activo: true,
    //   perfilPendiente: true, // Debe completar perfil al primer login
    // });

    await nuevoCiudadano.save();

    return res.status(201).json({
      success: true,
      message: `Ciudadano "${nombre}" creado exitosamente.`,
    });
  } catch (error) {
    console.error("Error en registerCiudadanoByAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Error al crear ciudadano.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

// export const registerCandidatoByAdmin = async (req, res) => {
//   try {
//     const { nombre, cedula, partido, idEleccion, fotoPerfil, propuestas } =
//       req.body;

//     console.log("🔵 [ADMIN→CANDIDATO] Registro por admin...");

//     if (
//       !nombre ||
//       !cedula ||
//       !partido ||
//       !idEleccion ||
//       !fotoPerfil ||
//       !propuestas
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Nombre, cédula, partido, elección, foto y propuestas son obligatorios",
//         error: "MISSING_FIELDS",
//       });
//     }

//     if (!/^\d{11}$/.test(cedula)) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "La cédula debe tener exactamente 11 dígitos",
//           error: "INVALID_CEDULA",
//           campo: "cedula",
//         });
//     }

//     const existeCedula = await Usuario.findOne({ cedula: cedula.trim() });
//     if (existeCedula) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "La cédula ya está registrada",
//           error: "CEDULA_EXISTS",
//           campo: "cedula",
//         });
//     }

//     const nombreExiste = await Usuario.findOne({
//       nombre: { $regex: new RegExp(`^${nombre.trim()}$`, "i") },
//     });
//     if (nombreExiste) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: `El nombre "${nombre}" ya está registrado`,
//           error: "NOMBRE_EXISTS",
//           campo: "nombre",
//         });
//     }

//     // Contraseña placeholder — login candidato usa cédula+nombre, no password
//     const salt = bcryptjs.genSaltSync(10);
//     const hashedPassword = bcryptjs.hashSync(cedula.trim(), salt);

//     // const nuevoCandidato = new Usuario({
//     //   nombre: nombre.trim(),
//     //   cedula: cedula.trim(),
//     //   password: hashedPassword,
//     //   rol: "candidato",
//     //   partido,
//     //   idEleccion,
//     //   fotoPerfil,
//     //   propuestas,
//     //   email: null,
//     //   telefono: null,
//     //   fechaNacimiento: null,
//     //   // ✅ Activo directamente — sin aprobación
//     //   estado: "activo",
//     //   activo: true,
//     //   totalVotos: 0,
//     // });

//     const nuevoCandidato = new Usuario({
//       nombre: nombre.trim(),
//       cedula: cedula.trim(),
//       password: hashedPassword,
//       rol: "candidato",
//       partido,
//       idEleccion,
//       fotoPerfil,
//       propuestas,
//       email: undefined, // ✅ undefined, no null
//       telefono: undefined, // ✅ undefined, no null
//       fechaNacimiento: undefined, // ✅ undefined, no null
//       estado: "activo",
//       activo: true,
//       totalVotos: 0,
//       perfilPendiente: true,
//     });

//     await nuevoCandidato.save();
//     console.log("✅ Candidato creado por admin:", nuevoCandidato._id);

//     // ✅ Sin notificación — registrado por admin no necesita aprobación
//     await Log.create({
//       accion: "registro_por_admin",
//       tipoUsuario: "candidato",
//       idUsuario: nuevoCandidato._id,
//       detalles: {
//         nombre,
//         cedula,
//         partido,
//         idEleccion,
//         creadoPor: req.user?._id,
//       },
//       ipAddress: req.ip,
//       userAgent: req.headers["user-agent"],
//       resultado: "exito",
//       severidad: "info",
//     });

//     const { password: _, ...candidatoSinPassword } = nuevoCandidato._doc;

//     res.status(201).json({
//       success: true,
//       message: `Candidato "${nombre}" registrado exitosamente. Al iniciar sesión deberá completar su perfil.`,
//       data: { usuario: candidatoSinPassword },
//     });
//   } catch (error) {
//     console.error("💥 Error en registerCandidatoByAdmin:", error);
//     if (error.code === 11000) {
//       const campo = Object.keys(error.keyPattern)[0];
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: `Ya existe un usuario con ese ${campo}`,
//           error: "DUPLICATE_KEY",
//           campo,
//         });
//     }
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Error al registrar candidato",
//         error: error.message,
//       });
//   }
// };

// export const registerCandidatoByAdmin = async (req, res) => {
//   try {
//     const { nombre, cedula, partido, propuestas, idEleccion, fotoPerfil } =
//       req.body;

//     if (!nombre || !cedula) {
//       return res.status(400).json({
//         success: false,
//         message: "Nombre y cédula son obligatorios.",
//         error: "MISSING_FIELDS",
//       });
//     }

//     const existeCedula = await Usuario.findOne({ cedula });
//     if (existeCedula) {
//       return res.status(400).json({
//         success: false,
//         message: "La cédula ya está registrada.",
//         error: "CEDULA_EXISTS",
//       });
//     }

//     const nuevoCandidato = new Usuario({
//       nombre,
//       cedula,
//       partido: partido || null,
//       propuestas: propuestas || null,
//       idEleccion: idEleccion || null,
//       fotoPerfil: fotoPerfil || null,
//       rol: "candidato",
//       estado: "activo",
//       activo: true,
//       perfilPendiente: !partido || !propuestas || !idEleccion,
//     });

//     await nuevoCandidato.save();

//     return res.status(201).json({
//       success: true,
//       message: `Candidato "${nombre}" creado exitosamente.`,
//     });
//   } catch (error) {
//     console.error("Error en registerCandidatoByAdmin:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error al crear candidato.",
//       error: isProduction ? "SERVER_ERROR" : error.message,
//     });
//   }
// };

export const registerCandidatoByAdmin = async (req, res) => {
  try {
    const { nombre, cedula, partido, idEleccion, fotoPerfil, propuestas } =
      req.body;

    console.log("🔵 [ADMIN→CANDIDATO] Registro por admin...");

    if (
      !nombre ||
      !cedula ||
      !partido ||
      !idEleccion ||
      !fotoPerfil ||
      !propuestas
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Nombre, cédula, partido, elección, foto y propuestas son obligatorios",
        error: "MISSING_FIELDS",
      });
    }

    if (!/^\d{11}$/.test(cedula)) {
      return res.status(400).json({
        success: false,
        message: "La cédula debe tener exactamente 11 dígitos",
        error: "INVALID_CEDULA",
        campo: "cedula",
      });
    }

    const existeCedula = await Usuario.findOne({ cedula: cedula.trim() });
    if (existeCedula) {
      return res.status(400).json({
        success: false,
        message: "La cédula ya está registrada",
        error: "CEDULA_EXISTS",
        campo: "cedula",
      });
    }

    // Contraseña temporal = cédula
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(cedula.trim(), salt);

    const nuevoCandidato = new Usuario({
      nombre: nombre.trim(),
      cedula: cedula.trim(),
      password: hashedPassword,
      rol: "candidato",
      partido,
      idEleccion,
      fotoPerfil,
      propuestas,
      email: undefined,
      telefono: undefined,
      fechaNacimiento: undefined,
      estado: "activo",
      activo: true,
      totalVotos: 0,
      perfilPendiente: true,
    });

    await nuevoCandidato.save();

    return res.status(201).json({
      success: true,
      message: `Candidato "${nombre}" registrado exitosamente. Contraseña temporal: su cédula.`,
    });
  } catch (error) {
    console.error("Error en registerCandidatoByAdmin:", error);
    if (error.code === 11000) {
      const campo = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Ya existe un usuario con ese ${campo}`,
        error: "DUPLICATE_KEY",
        campo,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error al registrar candidato",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// LOGIN — ADMIN
// ═══════════════════════════════════════════════════════════════════════

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son obligatorios.",
        error: "MISSING_FIELDS",
      });
    }

    const admin = await Usuario.findOne({ email, rol: "admin" });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas.",
        error: "INVALID_CREDENTIALS",
      });
    }

    const passwordCorrecto = await bcrypt.compare(password, admin.password);
    if (!passwordCorrecto) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas.",
        error: "INVALID_CREDENTIALS",
      });
    }

    if (!admin.activo || admin.estado === "bloqueado") {
      return res.status(403).json({
        success: false,
        message:
          "Cuenta bloqueada o inactiva. Contacta al administrador principal.",
        error: "ACCOUNT_BLOCKED",
      });
    }

    const tokenPayload = { id: admin._id, rol: "admin", email: admin.email };
    const accessToken = generarAccessToken(tokenPayload);
    const refreshToken = generarRefreshToken(tokenPayload);

    setCookieToken(res, accessToken);
    setRefreshCookie(res, refreshToken);

    const usuario = buildUserResponse(admin);

    return res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso.",
      data: {
        usuario,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Error en loginAdmin:", error);
    return res.status(500).json({
      success: false,
      message: "Error al iniciar sesión.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// LOGIN — CIUDADANO
// ═══════════════════════════════════════════════════════════════════════

// export const loginCiudadano = async (req, res) => {
//   try {
//     const { cedula, fechaNacimiento } = req.body;

//     if (!cedula || !fechaNacimiento) {
//       return res.status(400).json({
//         success: false,
//         message: "Cédula y fecha de nacimiento son obligatorias.",
//         error: "MISSING_FIELDS",
//       });
//     }

//     const ciudadano = await Usuario.findOne({ cedula, rol: "ciudadano" });
//     if (!ciudadano) {
//       return res.status(401).json({
//         success: false,
//         message: "Credenciales incorrectas.",
//         error: "INVALID_CREDENTIALS",
//       });
//     }

//     // Comparar fecha de nacimiento en UTC
//     const fechaIngresada = new Date(fechaNacimiento)
//       .toISOString()
//       .split("T")[0];
//     const fechaRegistrada = new Date(ciudadano.fechaNacimiento)
//       .toISOString()
//       .split("T")[0];

//     if (fechaIngresada !== fechaRegistrada) {
//       return res.status(401).json({
//         success: false,
//         message: "Credenciales incorrectas.",
//         error: "INVALID_CREDENTIALS",
//       });
//     }

//     if (!ciudadano.activo || ciudadano.estado === "bloqueado") {
//       return res.status(403).json({
//         success: false,
//         message: "Tu cuenta está bloqueada. Contacta al administrador.",
//         error: "ACCOUNT_BLOCKED",
//       });
//     }

//     if (ciudadano.estado === "pendiente_aprobacion") {
//       return res.status(403).json({
//         success: false,
//         message: "Tu cuenta está pendiente de aprobación.",
//         error: "PENDING_APPROVAL",
//       });
//     }

//     if (ciudadano.estado === "rechazado") {
//       return res.status(403).json({
//         success: false,
//         message: "Tu cuenta fue rechazada. Contacta al administrador.",
//         error: "ACCOUNT_REJECTED",
//       });
//     }

//     const tokenPayload = {
//       id: ciudadano._id,
//       rol: "ciudadano",
//       cedula: ciudadano.cedula,
//     };
//     const accessToken = generarAccessToken(tokenPayload);
//     const refreshToken = generarRefreshToken(tokenPayload);

//     setCookieToken(res, accessToken);

//     return res.status(200).json({
//       success: true,
//       message: "Inicio de sesión exitoso.",
//       data: {
//         usuario: buildUserResponse(ciudadano),
//         accessToken,
//         refreshToken,
//       },
//     });
//   } catch (error) {
//     console.error("Error en loginCiudadano:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error al iniciar sesión.",
//       error: isProduction ? "SERVER_ERROR" : error.message,
//     });
//   }
// };

/**login con contraseña  */

// export const loginCiudadano = async (req, res) => {
//   try {
//     const { cedula, password } = req.body;

//     if (!cedula || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Cédula y contraseña son obligatorias.",
//         error: "MISSING_FIELDS",
//       });
//     }

//     const ciudadano = await Usuario.findOne({ cedula, rol: "ciudadano" });
//     if (!ciudadano || !ciudadano.password) {
//       return res.status(401).json({
//         success: false,
//         message: "Credenciales incorrectas.",
//         error: "INVALID_CREDENTIALS",
//       });
//     }

//     const passwordCorrecto = await bcrypt.compare(password, ciudadano.password);
//     if (!passwordCorrecto) {
//       return res.status(401).json({
//         success: false,
//         message: "Credenciales incorrectas.",
//         error: "INVALID_CREDENTIALS",
//       });
//     }
//   } catch (error) {
//     console.error("Error en loginCiudadano:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error al iniciar sesión.",
//       error: isProduction ? "SERVER_ERROR" : error.message,
//     });
//   }
// };

export const loginCiudadano = async (req, res) => {
  try {
    const { cedula, password } = req.body;

    if (!cedula || !password) {
      return res.status(400).json({
        success: false,
        message: "Cédula y contraseña son obligatorias.",
        error: "MISSING_FIELDS",
      });
    }

    const ciudadano = await Usuario.findOne({ cedula, rol: "ciudadano" });
    if (!ciudadano || !ciudadano.password) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas.",
        error: "INVALID_CREDENTIALS",
      });
    }

    const passwordCorrecto = await bcrypt.compare(password, ciudadano.password);
    if (!passwordCorrecto) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas.",
        error: "INVALID_CREDENTIALS",
      });
    }

    if (!ciudadano.activo || ciudadano.estado === "bloqueado") {
      return res.status(403).json({
        success: false,
        message: "Cuenta bloqueada o inactiva. Contacta al administrador.",
        error: "ACCOUNT_BLOCKED",
      });
    }

    const tokenPayload = {
      id: ciudadano._id,
      rol: "ciudadano",
      cedula: ciudadano.cedula,
    };
    const accessToken = generarAccessToken(tokenPayload);
    const refreshToken = generarRefreshToken(tokenPayload);

    setCookieToken(res, accessToken);
    setRefreshCookie(res, refreshToken);

    const usuario = buildUserResponse(ciudadano);

    return res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso.",
      data: {
        usuario,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Error en loginCiudadano:", error);
    return res.status(500).json({
      success: false,
      message: "Error al iniciar sesión.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

// ═════════════════════════════════════════════k══════════════════════════
// LOGIN — CANDIDATO
// ═══════════════════════════════════════════════════════════════════════

// export const loginCandidato = async (req, res) => {
//   try {
//     const { cedula, nombre } = req.body;

//     if (!cedula || !nombre) {
//       return res.status(400).json({
//         success: false,
//         message: "Cédula y nombre son obligatorios.",
//         error: "MISSING_FIELDS",
//       });
//     }

//     const candidato = await Usuario.findOne({ cedula, rol: "candidato" });
//     if (!candidato) {
//       return res.status(401).json({
//         success: false,
//         message: "Credenciales incorrectas.",
//         error: "INVALID_CREDENTIALS",
//       });
//     }

//     if (candidato.nombre.toLowerCase().trim() !== nombre.toLowerCase().trim()) {
//       return res.status(401).json({
//         success: false,
//         message: "Credenciales incorrectas.",
//         error: "INVALID_CREDENTIALS",
//       });
//     }

//     if (!candidato.activo || candidato.estado === "bloqueado") {
//       return res.status(403).json({
//         success: false,
//         message: "Tu cuenta está bloqueada.",
//         error: "ACCOUNT_BLOCKED",
//       });
//     }

//     if (candidato.estado === "pendiente_aprobacion") {
//       return res.status(403).json({
//         success: false,
//         message: "Tu cuenta está pendiente de aprobación.",
//         error: "PENDING_APPROVAL",
//       });
//     }

//     const tokenPayload = {
//       id: candidato._id,
//       rol: "candidato",
//       cedula: candidato.cedula,
//       idEleccion: candidato.idEleccion,
//     };
//     const accessToken = generarAccessToken(tokenPayload);
//     const refreshToken = generarRefreshToken(tokenPayload);

//     setCookieToken(res, accessToken);

//     return res.status(200).json({
//       success: true,
//       message: "Inicio de sesión exitoso.",
//       data: {
//         usuario: buildUserResponse(candidato),
//         accessToken,
//         refreshToken,
//       },
//     });
//   } catch (error) {
//     console.error("Error en loginCandidato:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error al iniciar sesión.",
//       error: isProduction ? "SERVER_ERROR" : error.message,
//     });
//   }
// };

/**login con contarseña  */

// export const loginCandidato = async (req, res) => {
//   try {
//     const { cedula, password } = req.body;

//     if (!cedula || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Cédula y contraseña son obligatorias.",
//         error: "MISSING_FIELDS",
//       });
//     }

//     const candidato = await Usuario.findOne({ cedula, rol: "candidato" });
//     if (!candidato || !candidato.password) {
//       return res.status(401).json({
//         success: false,
//         message: "Credenciales incorrectas.",
//         error: "INVALID_CREDENTIALS",
//       });
//     }

//     const passwordCorrecto = await bcrypt.compare(password, candidato.password);
//     if (!passwordCorrecto) {
//       return res.status(401).json({
//         success: false,
//         message: "Credenciales incorrectas.",
//         error: "INVALID_CREDENTIALS",
//       });
//     }
//   } catch (error) {
//     console.error("Error en loginCandidato:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error al iniciar sesión.",
//       error: isProduction ? "SERVER_ERROR" : error.message,
//     });
//   }
// };

// ═══════════════════════════════════════════════════════════════════════
// GOOGLE OAUTH CALLBACK
// ═══════════════════════════════════════════════════════════════════════

export const loginCandidato = async (req, res) => {
  try {
    const { cedula, password } = req.body;

    if (!cedula || !password) {
      return res.status(400).json({
        success: false,
        message: "Cédula y contraseña son obligatorias.",
        error: "MISSING_FIELDS",
      });
    }

    const candidato = await Usuario.findOne({ cedula, rol: "candidato" });
    if (!candidato || !candidato.password) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas.",
        error: "INVALID_CREDENTIALS",
      });
    }

    const passwordCorrecto = await bcrypt.compare(password, candidato.password);
    if (!passwordCorrecto) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas.",
        error: "INVALID_CREDENTIALS",
      });
    }

    if (!candidato.activo || candidato.estado === "bloqueado") {
      return res.status(403).json({
        success: false,
        message: "Cuenta bloqueada o inactiva. Contacta al administrador.",
        error: "ACCOUNT_BLOCKED",
      });
    }

    const tokenPayload = {
      id: candidato._id,
      rol: "candidato",
      cedula: candidato.cedula,
    };
    const accessToken = generarAccessToken(tokenPayload);
    const refreshToken = generarRefreshToken(tokenPayload);

    setCookieToken(res, accessToken);
    setRefreshCookie(res, refreshToken);

    const usuario = buildUserResponse(candidato);

    return res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso.",
      data: {
        usuario,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Error en loginCandidato:", error);
    return res.status(500).json({
      success: false,
      message: "Error al iniciar sesión.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};
/********************************* */
export const googleCallback = async (req, res) => {
  try {
    const usuario = req.user;
    if (!usuario) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/iniciosesion?error=oauth_failed`,
      );
    }

    const tokenPayload = {
      id: usuario._id,
      rol: usuario.rol,
      email: usuario.email,
    };
    const accessToken = generarAccessToken(tokenPayload);

    setCookieToken(res, accessToken);
    setRefreshCookie(res, refreshToken);

    const params = new URLSearchParams({
      token: accessToken,
    });

    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/google/callback?${params.toString()}`,
    );
  } catch (error) {
    console.error("Error en Google OAuth googleCallback:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/iniciosesion?error=server_error`,
    );
  }
};

export const googleRegister = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Google OAuth procesado correctamente.",
  });
};

export const googleAuthSuccess = (req, res) => {
  if (req.user) {
    const { password, ...usuarioSinPassword } = req.user._doc;
    res.json({ success: true, data: { usuario: usuarioSinPassword } });
  } else {
    res.status(401).json({ success: false, message: "No autenticado" });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// GESTIÓN DE SESIÓN
// ═══════════════════════════════════════════════════════════════════════

export const logout = (req, res) => {
  // res.clearCookie("access_token", {
  //   httpOnly: true,
  //   secure: isProduction,
  //   sameSite: isProduction ? "none" : "lax",
  //   path: "/",
  // });

  res.clearCookie("access_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
  });

  return res.status(200).json({
    success: true,
    message: "Sesión cerrada correctamente.",
  });
};

export const verifyToken = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user._id).select("-password");
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
        error: "USER_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      data: { usuario: buildUserResponse(usuario) },
    });
  } catch (error) {
    console.error("Error en verifyToken:", error);
    return res.status(500).json({
      success: false,
      message: "Error al verificar token.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const refreshToken = async (req, res) => {
  // try {
  //   const { refreshToken: token } = req.body;

  //   if (!token) {
  //     return res.status(401).json({
  //       success: false,
  //       message: "Refresh token no proporcionado.",
  //       error: "NO_REFRESH_TOKEN",
  //     });
  //   }

  try {
    const token = req.cookies?.refresh_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token no proporcionado.",
        error: "NO_REFRESH_TOKEN",
      });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Sesión expirada. Por favor inicia sesión nuevamente."
            : "Token inválido.",
        error:
          err.name === "TokenExpiredError"
            ? "REFRESH_EXPIRED"
            : "INVALID_REFRESH",
      });
    }

    const usuario = await Usuario.findById(decoded.id).select("-password");
    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        success: false,
        message: "Usuario no válido.",
        error: "INVALID_USER",
      });
    }

    const tokenPayload = {
      id: usuario._id,
      rol: usuario.rol,
      email: usuario.email,
    };
    const newAccessToken = generarAccessToken(tokenPayload);

    setCookieToken(res, newAccessToken);

    return res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    console.error("Error en refreshToken:", error);
    return res.status(500).json({
      success: false,
      message: "Error al renovar token.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};

export const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNuevo } = req.body;

    if (!passwordActual || !passwordNuevo) {
      return res.status(400).json({
        success: false,
        message: "Contraseña actual y nueva son obligatorias.",
        error: "MISSING_FIELDS",
      });
    }

    if (passwordNuevo.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La nueva contraseña debe tener al menos 6 caracteres.",
        error: "PASSWORD_TOO_SHORT",
      });
    }

    const usuario = await Usuario.findById(req.user._id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado.",
        error: "USER_NOT_FOUND",
      });
    }

    if (usuario.esGoogleAuth) {
      return res.status(400).json({
        success: false,
        message: "Los usuarios de Google no pueden cambiar su contraseña aquí.",
        error: "GOOGLE_AUTH_USER",
      });
    }

    const passwordValido = await bcrypt.compare(
      passwordActual,
      usuario.password,
    );
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: "La contraseña actual es incorrecta.",
        error: "INVALID_PASSWORD",
      });
    }

    const salt = await bcrypt.genSalt(12);
    usuario.password = await bcrypt.hash(passwordNuevo, salt);

    // Si tenía perfil pendiente por ser creado por admin, marcar como completado
    if (usuario.perfilPendiente) {
      usuario.perfilPendiente = false;
    }

    await usuario.save();

    return res.status(200).json({
      success: true,
      message: "Contraseña actualizada exitosamente.",
    });
  } catch (error) {
    console.error("Error en cambiarPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Error al cambiar contraseña.",
      error: isProduction ? "SERVER_ERROR" : error.message,
    });
  }
};
export default {
  registerAdmin,
  registerCiudadano,
  registerCandidato,
  registerAdminByAdmin,
  registerCiudadanoByAdmin,
  registerCandidatoByAdmin,
  loginAdmin,
  loginCiudadano,
  loginCandidato,
  googleCallback,
  googleAuthSuccess,
  logout,
  verifyToken,
  refreshToken,
  cambiarPassword,
};
