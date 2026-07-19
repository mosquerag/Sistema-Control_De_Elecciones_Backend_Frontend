import Usuario from "../models/Usuario.js";
import jwt from "jsonwebtoken";

// Registro ciudadano (público)
export const registerCiudadano = async (req, res) => {
  try {
    const { nombre, cedula, fechaNacimiento, nacionalidad, edad } = req.body;

    // Verificar que la cédula no exista
    const existeCedula = await Usuario.findOne({ cedula });
    if (existeCedula) {
      return res.status(400).json({ message: "La cédula ya está registrada" });
    }

    // Crear ciudadano
    const nuevoCiudadano = new Usuario({
      nombre,
      cedula,
      fechaNacimiento,
      nacionalidad,
      edad, // Ya calculado en middleware
      rol: "ciudadano",
    });

    await nuevoCiudadano.save();
    res.status(201).json({
      message: "Registro exitoso. Ya puedes iniciar sesión",
      ciudadano: {
        nombre: nuevoCiudadano.nombre,
        cedula: nuevoCiudadano.cedula,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login ciudadano (cedula + fechaNacimiento)
export const loginCiudadano = async (req, res) => {
  try {
    const { cedula, fechaNacimiento } = req.body;

    // Buscar ciudadano
    const ciudadano = await Usuario.findOne({ cedula, rol: "ciudadano" });
    if (!ciudadano) {
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    // Comparar fecha de nacimiento
    const fechaIngresada = new Date(fechaNacimiento)
      .toISOString()
      .split("T")[0];
    const fechaRegistrada = new Date(ciudadano.fechaNacimiento)
      .toISOString()
      .split("T")[0];

    if (fechaIngresada !== fechaRegistrada) {
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    // Verificar que esté activo
    if (!ciudadano.activo) {
      return res.status(400).json({ message: "Cuenta inactiva" });
    }

    // Re-validar edad
    if (ciudadano.edad < 18) {
      return res.status(400).json({ message: "Debes ser mayor de edad" });
    }

    // Generar token
    const token = jwt.sign(
      { id: ciudadano._id, cedula: ciudadano.cedula, rol: "ciudadano" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Enviar token en cookie
    // res.cookie('access_token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 24 * 60 * 60 * 1000
    // });

    // ✅ DESPUÉS:
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: false, // false en desarrollo
      sameSite: "lax", // 'lax' en lugar de 'strict'
      maxAge: 24 * 60 * 60 * 1000,
      path: "/", // Asegurar que esté disponible en todas las rutas
    });

    res.status(200).json({
      id: ciudadano._id,
      nombre: ciudadano.nombre,
      cedula: ciudadano.cedula,
      rol: "ciudadano",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
