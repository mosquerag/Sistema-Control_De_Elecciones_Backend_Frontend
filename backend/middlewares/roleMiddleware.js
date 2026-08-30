export const esAdmin = (req, res, next) => {
  if (req.user && req.user.rol === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de administrador'
    });
  }
};

export const esCiudadano = (req, res, next) => {
  if (req.user && req.user.rol === 'ciudadano') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de ciudadano'
    });
  }
};

export const esCandidato = (req, res, next) => {
  if (req.user && req.user.rol === 'candidato') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de candidato'
    });
  }
};