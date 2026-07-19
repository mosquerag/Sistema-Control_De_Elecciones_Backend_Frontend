import Usuario from "../models/Usuario.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Registrar nuevo admin (solo otro admin puede hacerlo)
export const registerAdmin = async (req, res) => {
  try {
    const { nombre, email, password, cedula } = req.body;

    // Verificar que el email no exista
    const existeEmail = await Usuario.findOne({ email });
    if (existeEmail) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // Hash del password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Crear admin
    const nuevoAdmin = new Usuario({
      nombre,
      email,
      password: hashedPassword,
      rol: "admin",
    });

    await nuevoAdmin.save();

    // No devolver el password
    const { password: _, ...adminSinPassword } = nuevoAdmin._doc;
    res.status(201).json(adminSinPassword);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Login admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar admin por email
    const admin = await Usuario.findOne({ email, rol: "admin" });
    if (!admin) {
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    // Verificar password
    const passwordCorrecto = await bcrypt.compare(password, admin.password);
    if (!passwordCorrecto) {
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    // Verificar que esté activo
    if (!admin.activo) {
      return res.status(400).json({ message: "Cuenta inactiva" });
    }

    // Generar token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, rol: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Enviar token en cookie
    // res.cookie('access_token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 24 * 60 * 60 * 1000 // 24 horas
    // });

    // ✅ DESPUÉS:
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: false, // false en desarrollo
      sameSite: "lax", // 'lax' en lugar de 'strict'
      maxAge: 24 * 60 * 60 * 1000,
      path: "/", // Asegurar que esté disponible en todas las rutas
    });

    // Devolver datos sin password
    // const { password: _, ...adminSinPassword } = admin._doc;
    // res.status(200).json({ ...adminSinPassword, token });
    const { password: _pass, ...adminSinPassword } = admin._doc;
    res.status(200).json(adminSinPassword);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
