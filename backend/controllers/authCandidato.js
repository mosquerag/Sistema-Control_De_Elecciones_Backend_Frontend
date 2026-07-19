import Usuario from "../models/Usuario.js";
import jwt from "jsonwebtoken";

// Registrar candidato (solo admin)
export const registerCandidato = async (req, res) => {
  try {
    const { nombre, cedula, partido, propuestas, fotoPerfil , idEleccion } = req.body;

    // erificar que la cédula no exista
    const existeCedula = await Usuario.findOne({ cedula });
    
    if (existeCedula) {
      return res.status(400).json({ message: "La cédula ya está registrada" });
    }

    // ear candidato
    const nuevoCandidato = new Usuario({
      nombre,
      cedula,
      partido,
      propuestas,
      fotoPerfil,
      idEleccion,
      rol: "candidato",
      totalVotos: 0,
    });

    await nuevoCandidato.save();
    res.status(201).json(nuevoCandidato);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login candidato (cedula + nombre
export const loginCandidato = async (req, res) => {
  try {
    const { cedula, nombre } = req.body;

    // Buscar candidato
    const candidato = await Usuario.findOne({ cedula, rol: "candidato" });
    if (!candidato) {
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    // Verificar nombre
    if (candidato.nombre.toLowerCase() !== nombre.toLowerCase()) {
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    // Verificar que esté activo
    if (!candidato.activo) {
      return res.status(400).json({ message: "Cuenta inactiva" });
    }

    // Generar token
    const token = jwt.sign(
      {
        id: candidato._id,
        cedula: candidato.cedula,
        rol: "candidato",
        idEleccion: candidato.idEleccion,
      },
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

    // ✅ DESPUÉS:// ✅ DESPUÉS:
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: false, // false en desarrollo
      sameSite: "lax", // 'lax' en lugar de 'strict'
      maxAge: 24 * 60 * 60 * 1000,
      path: "/", // Asegurar que esté disponible en todas las rutas
    });

    res.status(200).json({
      id: candidato._id,
      nombre: candidato.nombre,
      cedula: candidato.cedula,
      partido: candidato.partido,
      idEleccion: candidato.idEleccion,
      rol: "candidato",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
