export const validateAge = (req, res, next) => {
  try {
    // Si no hay fecha de nacimiento, simplemente continuar
    if (!req.body.fechaNacimiento) {
      return next();
    }

    const fechaNacimiento = new Date(req.body.fechaNacimiento);
    const hoy = new Date();

    // Validar que la fecha sea válida
    if (isNaN(fechaNacimiento.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Fecha de nacimiento inválida.",
        error: "INVALID_BIRTHDATE",
      });
    }

    // Calcular edad
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }

    console.log("🎂 Edad calculada:", edad);

    // Validar edad mínima
    if (edad < 18) {
      return res.status(400).json({
        success: false,
        message: "Debes ser mayor de 18 años para registrarte.",
        error: "UNDERAGE",
        data: { edad, edadMinima: 18 },
      });
    }

    // Agregar edad al body
    req.body.edad = edad;

    next();
  } catch (error) {
    console.error("❌ ERROR EN validateAge:", error);
    return res.status(500).json({
      success: false,
      message: "Error al validar edad.",
      error: error.message,
    });
  }
};

export default validateAge;